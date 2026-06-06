import logging
from typing import List
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from executor.persistence.models import Scan, Task, ScanResponse as DBScanResponse
from executor.integration.sys_path_setup import setup_paths
setup_paths()

from result_collector import ScanResultCollector
from models import ScanResponse as TLLScanResponse

logger = logging.getLogger(__name__)

class ReportService:
    @staticmethod
    async def generate_report(scan_id: str, db: AsyncSession, output_dir: str = "./reports"):
        """
        Fetches all tasks and responses for a scan, feeds them to TLL Alpha's collector,
        and generates a report.
        """
        logger.info(f"Generating report for scan {scan_id}")
        
        # 1. Fetch scan
        stmt_scan = select(Scan).where(Scan.id == scan_id)
        result_scan = await db.execute(stmt_scan)
        scan = result_scan.scalar_one_or_none()
        if not scan:
            raise ValueError(f"Scan {scan_id} not found")
            
        # 2. Fetch tasks with responses
        stmt_tasks = select(Task).options(selectinload(Task.response)).where(Task.scan_id == scan_id)
        result_tasks = await db.execute(stmt_tasks)
        tasks = result_tasks.scalars().all()
        
        # 3. Setup Collector
        collector = ScanResultCollector(
            target_url=scan.target,
            scan_name=scan.name,
            similarity_threshold=0.65,
            reference_role="admin" # Default
        )
        
        # 4. Feed responses
        fed_count = 0
        for task in tasks:
            resp = task.response
            if not resp or resp.status_code is None:
                continue
                
            # Parse body as JSON if possible
            body_json = None
            if resp.response_body:
                try:
                    body_json = json.loads(resp.response_body)
                except Exception:
                    pass
                    
            # Try to extract role/user_id from auth token (hacky but functional for now)
            # In a real app we'd decode the JWT here
            role = "user"
            user_id = "unknown"
            token = None
            if task.headers and "Authorization" in task.headers:
                token = task.headers["Authorization"].replace("Bearer ", "")
                # Very naive parsing to get role for the demo (we used dummy JWTs)
                import jwt
                try:
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    role = decoded.get("role", role)
                    user_id = decoded.get("user_id", user_id)
                except Exception:
                    pass
            
            tll_resp = TLLScanResponse(
                endpoint=task.url,
                method=task.method,
                url=task.url,
                status_code=resp.status_code,
                headers=resp.response_headers or {},
                body=resp.response_body,
                body_json=body_json,
                user_id=user_id,
                role=role,
                token=token,
                request_headers=task.headers or {},
                request_body=task.payload if isinstance(task.payload, str) else json.dumps(task.payload) if task.payload else None,
                latency_ms=resp.latency_ms
            )
            collector.on_result(tll_resp)
            fed_count += 1
            
        logger.info(f"Fed {fed_count} responses to TLL Alpha for analysis.")
        
        # 5. Flush and Save
        report = collector.flush()
        paths = collector.save(report, output_dir=output_dir)
        
        return {
            "report_id": report.report_id,
            "issues_found": report.summary.total_issues,
            "paths": paths
        }
