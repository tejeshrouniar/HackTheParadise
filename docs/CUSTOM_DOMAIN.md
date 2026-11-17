# Hack The Paradise hosting

## Cloudflare Pages migration (17 November 2026)

The static Vite build is deployed to [hacktheparadise.pages.dev](https://hacktheparadise.pages.dev/) on the Cloudflare Free plan. The `www.hacktheparadise.com` domain has been added to the `hacktheparadise` Pages project and is awaiting its DNS change at BigRock. Change only the existing `www` CNAME target from `tejeshrouniar.github.io` to `hacktheparadise.pages.dev`. Keep the GitHub Pages deployment as a fallback until Cloudflare reports the custom domain active and HTTPS works on the public domain.

For direct deployments, run `npm test`, then build with the public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values from the current deployment configuration. Run `npx wrangler pages deploy dist --project-name hacktheparadise --branch main` after `npx wrangler login`. Do not use a Supabase service-role key in a Vite variable. The combined story film was compressed below Cloudflare Pages' 25 MiB per-file limit.

The bare `hacktheparadise.com` name still uses BigRock DNS and the old GitHub Pages address records. Move or redirect that hostname only after the `www` hostname is serving the Cloudflare deployment with a valid certificate. Supabase's Site URL can remain `https://www.hacktheparadise.com/` because the public origin is unchanged.

## Previous GitHub Pages setup

The production URL is [www.hacktheparadise.com](https://www.hacktheparadise.com/). GitHub Actions builds the site and deploys it to GitHub Pages. BigRock serves the domain's DNS.

## Activate the domain

1. In [the repository's Pages settings](https://github.com/tejeshrouniar/HackTheParadise/settings/pages), use GitHub Actions as the source and `www.hacktheparadise.com` as the custom domain. GitHub reads this setting for Actions deployments.
2. Keep the website records below at the authoritative DNS provider. Preserve domain verification, email, and unrelated records.

| Type | Name | Target |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | tejeshrouniar.github.io |

3. After GitHub's DNS check and certificate issuance finish, enable Enforce HTTPS in Pages settings.
4. Use `https://www.hacktheparadise.com/` as the Supabase Site URL and in its Redirect URLs. Retain localhost entries for development. See the [Supabase setup](../SUPABASE_SETUP.md) for the separate Google OAuth callback.

## Verify after activation

Check both hostnames over HTTPS before sharing the shorter address. A redirect to `www` needs a valid certificate on the bare domain before a visitor's browser can read it. The Enforce HTTPS setting alone does not show that both hostnames are covered.

```powershell
curl.exe -I https://www.hacktheparadise.com/
curl.exe -I https://hacktheparadise.com/
curl.exe -I http://hacktheparadise.com/
```

When inspecting a certificate mismatch, check the certificate's domain list in the [Pages API](https://docs.github.com/en/rest/pages/pages#get-a-github-pages-site). Follow [GitHub's certificate provisioning guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#troubleshooting-certificate-provisioning-certificate-not-yet-created-error) after validating DNS. Keep links pointed at the verified `www` URL during provisioning.
