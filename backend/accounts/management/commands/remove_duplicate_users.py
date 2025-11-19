"""
Django management command to remove duplicate user accounts.
Keeps the most recently created account for each email address.

Usage:
    python manage.py remove_duplicate_users
    python manage.py remove_duplicate_users --dry-run  # Preview without deleting
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Count

User = get_user_model()


class Command(BaseCommand):
    help = 'Removes duplicate user accounts, keeping the most recent one for each email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Find emails that have duplicates
        duplicate_emails = (
            User.objects.values('email')
            .annotate(email_count=Count('email'))
            .filter(email_count__gt=1)
        )

        if not duplicate_emails:
            self.stdout.write(self.style.SUCCESS('No duplicate emails found!'))
            return

        total_to_delete = 0
        
        for item in duplicate_emails:
            email = item['email']
            count = item['email_count']
            
            # Get all users with this email, ordered by most recent first
            users = User.objects.filter(email=email).order_by('-date_joined')
            
            # Keep the first (most recent), delete the rest
            users_to_keep = users.first()
            users_to_delete = users[1:]
            
            self.stdout.write(
                self.style.WARNING(f'\nEmail: {email} has {count} accounts')
            )
            self.stdout.write(
                self.style.SUCCESS(f'  Keeping: {users_to_keep.username} (ID: {users_to_keep.id}, joined: {users_to_keep.date_joined})')
            )
            
            for user in users_to_delete:
                total_to_delete += 1
                self.stdout.write(
                    self.style.ERROR(f'  Deleting: {user.username} (ID: {user.id}, joined: {user.date_joined})')
                )
                
                if not dry_run:
                    user.delete()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'\nDRY RUN: Would delete {total_to_delete} duplicate account(s)')
            )
            self.stdout.write(
                self.style.WARNING('Run without --dry-run to actually delete them')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nSuccessfully deleted {total_to_delete} duplicate account(s)')
            )
