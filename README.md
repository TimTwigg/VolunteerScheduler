<hr/>
<h1 align = "center">
    Volunteer Scheduler
    <img alt = "" src = "./app/icon.ico" width = "30"/>
</h1>

# Overview

The Volunteer Scheduler is a full-stack web application to automate volunteer scheduling based on data submitted via Google Forms.

Check out the <a href = "https://volunteerscheduler.vercel.app" target = "_blank">Volunteer Scheduler</a>.

# Motivation

Scheduling volunteers for a regularly ocurring service can sometimes be a confusing mess. Volunteers don't always give their availabilities in a consistent manner,
and often need to change availabilities. Existing services to simplify this are often expensive. This project aims to simplify this whole process to the following
format:
- Volunteers submit a Google form with their availabilities.
- The admin uses this web app to schedule volunteers, with the app automatically managing limitations such as:
    - Volunteers who can only volunteer on some days of the month
    - Volunteers who don't want to volunteer more than a certain number of times in the month