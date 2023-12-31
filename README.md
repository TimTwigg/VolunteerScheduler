# Volunteer Scheduler

Scheduling volunteers for a regularly ocurring service can sometimes be a confusing mess. Volunteers don't always give their availabilities in a consistent manner,
and often need to change availabilities. Existing services to simplify this are often expensive. This project aims to simplify this whole process to the following
format:
- Volunteers submit a Google form with their availabilities.
- The admin uses this web app to schedule volunteers, with the app automatically managing limitations such as:
    - Volunteers who can only volunteer on some days of the month
    - Volunteers who don't want to volunteer more than a certain number of times in the month

## Attribution

The authentication code was adapted from [this](https://github.com/nextauthjs/next-auth-example/tree/main) project.

## Deployment Note

The project will be [deployed](https://nextjs.org/learn/basics/deploying-nextjs-app/github) using GitHub Pages and the Vercel Platform.