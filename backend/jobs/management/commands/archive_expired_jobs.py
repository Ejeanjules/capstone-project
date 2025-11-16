"""
Django management command to automatically archive jobs that have reached their scheduled archive time.

This command should be run periodically (e.g., every 15-30 minutes) via a cron job or task scheduler.

Usage:
    python manage.py archive_expired_jobs

Example cron job (runs every 15 minutes):
    */15 * * * * cd /path/to/project && python manage.py archive_expired_jobs
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from jobs.models import Job


class Command(BaseCommand):
    help = 'Automatically archives jobs that have reached their scheduled archive time'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be archived without actually archiving',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()

        # Find all active, non-archived jobs that have passed their archive time
        jobs_to_archive = Job.objects.filter(
            is_active=True,
            is_archived=False,
            archive_at__isnull=False,
            archive_at__lte=now
        )

        count = jobs_to_archive.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('No jobs to archive at this time.'))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN: Would archive {count} job(s):')
            )
            for job in jobs_to_archive:
                self.stdout.write(
                    f'  - Job #{job.id}: {job.title} at {job.company} '
                    f'(scheduled for {job.archive_at})'
                )
        else:
            # Archive the jobs
            archived_jobs = []
            for job in jobs_to_archive:
                job.is_archived = True
                job.save(update_fields=['is_archived'])
                archived_jobs.append(
                    f'Job #{job.id}: {job.title} at {job.company}'
                )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully archived {count} job(s):')
            )
            for job_info in archived_jobs:
                self.stdout.write(f'  - {job_info}')

        return
