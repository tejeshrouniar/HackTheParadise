# Hack The Paradise on GitHub Pages

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
