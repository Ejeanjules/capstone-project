# Scheduled Job Archiving

## Overview
Job posters can now schedule when their job postings should be automatically archived by selecting a date and time when creating or editing a job.

## Features
- **Manual Archiving**: Job owners can manually archive/unarchive jobs at any time
- **Scheduled Archiving**: Set a future date/time for automatic archiving
- **Archive Tab**: View all your archived jobs in a dedicated tab
- **Privacy**: Only job owners can see and manage their archived jobs

## How It Works

### Frontend
1. When creating or editing a job, use the "Schedule Archive Time" field to select when the job should be automatically archived
2. The datetime picker allows you to choose both date and time
3. Leave blank if you don't want scheduled archiving
4. Manually archived jobs can be unarchived at any time from the "Archived" tab

### Backend
Jobs are automatically archived when their scheduled time is reached. This is handled by a Django management command that runs periodically.

## Setting Up Automatic Archiving

### Development (Local)

#### Option 1: Manual Testing
Run the command manually to test:
```bash
python manage.py archive_expired_jobs
```

To see what would be archived without actually doing it:
```bash
python manage.py archive_expired_jobs --dry-run
```

#### Option 2: Windows Task Scheduler
1. Open Task Scheduler
2. Create a new task:
   - **Trigger**: Every 15 minutes
   - **Action**: Start a program
   - **Program**: `python`
   - **Arguments**: `manage.py archive_expired_jobs`
   - **Start in**: `C:\path\to\your\project\backend`

### Production (Render.com)

#### Using Render Cron Jobs
1. In your `render.yaml`, add a cron job service:
```yaml
- type: cron
  name: archive-expired-jobs
  env: python
  schedule: "*/15 * * * *"  # Every 15 minutes
  buildCommand: "pip install -r requirements.txt"
  startCommand: "cd backend && python manage.py archive_expired_jobs"
```

2. Or add it to your existing web service's build script in `build.sh`:
```bash
# Add to build.sh to run on deploy
python manage.py archive_expired_jobs
```

#### Using External Cron Service
You can use services like:
- **EasyCron** (https://www.easycron.com)
- **cron-job.org** (https://cron-job.org)

Configure them to hit an endpoint that triggers the command:
1. Create a view in `jobs/views.py`:
```python
from django.views.decorators.http import require_POST
from django.core.management import call_command

@require_POST
def trigger_archive_job(request):
    # Add authentication here (API key, token, etc.)
    call_command('archive_expired_jobs')
    return JsonResponse({'status': 'success'})
```

2. Add to `jobs/urls.py`:
```python
path('trigger-archive/', views.trigger_archive_job),
```

3. Configure the cron service to POST to: `https://your-app.onrender.com/api/jobs/trigger-archive/`

## Database Fields
- `is_archived` (Boolean): Whether the job is currently archived
- `archive_at` (DateTime): Scheduled time for automatic archiving (nullable)

## API Endpoints
- `POST /api/jobs/{id}/archive/` - Toggle archive status (manual)
- `GET /api/jobs/archived/` - Get all archived jobs for current user

## Testing
1. Create a job with archive time set to 1-2 minutes in the future
2. Wait for the scheduled time
3. Run the management command: `python manage.py archive_expired_jobs`
4. Verify the job appears in your "Archived" tab
5. Test unarchiving by clicking the "📤 Unarchive" button

## Notes
- Archived jobs are hidden from the main job listings
- Only the job poster can see their archived jobs
- Archived jobs can be unarchived at any time
- The scheduled archive time is optional - jobs can exist indefinitely without archiving
- Once archived (manually or automatically), jobs remain archived until manually unarchived
