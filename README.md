# AI Tutor Notes Feedback Demo

Static frontend + Vercel serverless API for AI-powered note feedback.

## Deploying on Vercel (Hobby)

1. Import this repository into Vercel.
2. Add the environment variable `OPENAI_API_KEY` in Project Settings → Environment Variables.
3. Deploy.

The frontend calls the same-origin endpoint `/api/feedback`, and the OpenAI API key is only used server-side in `api/feedback.js`.

### Hobby plan repo limitations

- Vercel Hobby teams cannot deploy from a private GitHub organization repository.
  - Use a personal repository, or make the repository public if needed.
- For private repositories on Hobby, deployments may fail if Vercel cannot verify the commit author.
