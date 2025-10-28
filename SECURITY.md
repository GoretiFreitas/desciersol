# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in DeSci Reviews, please report it responsibly by:

1. **DO NOT** open a public GitHub issue
2. Email the details to: [security@descireviews.com] (or create a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue promptly.

## Security Best Practices

### For Developers

#### 1. Private Key Management

**CRITICAL: Never commit private keys or keypairs to version control**

- Use `.env` files for sensitive configuration (already in `.gitignore`)
- Store mainnet keypairs in secure, encrypted locations
- Use environment variables in production (Vercel Secrets)
- Rotate keys if compromised immediately

Protected files:
```
.env*
keypair.json
keypair-mainnet.json
*-private-key.txt
*.key
*.pem
```

#### 2. Environment Variables

**Development (.env.local):**
```bash
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
# Use devnet keypairs only
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=XXX
IRYS_PRIVATE_KEY=<base58_encoded> # Mark as SECRET
```

**Rules:**
- Never expose `IRYS_PRIVATE_KEY` in frontend code
- Only `NEXT_PUBLIC_*` variables are visible to the browser
- Mark sensitive variables as "Secret" in Vercel dashboard
- Rotate API keys periodically

#### 3. API Security

**Rate Limiting:**
- Upload API: 5 uploads per hour per IP
- Consider using Vercel KV or Upstash for production
- Monitor for abuse patterns

**Input Validation:**
- PDF files: Max 50MB
- Images: Max 10MB
- Validate MIME types server-side
- Sanitize filenames to prevent injection

**Error Handling:**
- Never expose stack traces to clients
- Log detailed errors server-side only
- Return user-friendly error messages
- Monitor error rates in Vercel logs

#### 4. Solana Transaction Security

**Wallet Integration:**
- Never request private keys from users
- All transactions signed client-side in user's wallet
- Verify transaction details before signing
- Use confirmed commitment level

**Backend Keypair (for Irys uploads):**
- Use dedicated keypair with minimal SOL balance
- Monitor balance and set alerts for < 0.1 SOL
- Keep treasury and backend keypairs separate
- Implement withdrawal limits if possible

### For Users

#### 1. Wallet Security

- Only connect wallets on official domain
- Verify transaction details before signing
- Never share your private key or seed phrase
- Use hardware wallets for large amounts

#### 2. Mainnet vs Devnet

- Development/testing: Use **devnet** only
- Production: Ensure wallet is on **mainnet-beta**
- Never send real SOL to devnet addresses
- Check network in wallet before transactions

#### 3. Transaction Verification

- Verify NFT minted to correct address
- Check Arweave URIs are accessible
- Confirm transaction on Solana Explorer
- Report suspicious activity immediately

## Audit History

| Date | Type | Auditor | Status |
|------|------|---------|--------|
| TBD | Smart Contract | - | Pending |
| TBD | Security Review | - | Pending |

## Security Features

### Implemented

- ✅ HTTPS enforced (Vercel automatic)
- ✅ Security headers (CSP, XSS protection)
- ✅ Rate limiting on uploads
- ✅ Input validation server-side
- ✅ Environment variable protection
- ✅ Error handling without stack traces
- ✅ Client-side wallet signing only

### Planned

- 🔄 Multi-sig for treasury operations
- 🔄 On-chain program audit
- 🔄 Formal security review
- 🔄 Bug bounty program
- 🔄 2FA for admin operations

## Compliance

### Data Privacy

- No personal data collected without consent
- Wallet addresses are public by design (blockchain)
- PDF metadata stored permanently on Arweave
- GDPR considerations: right to deletion not applicable to immutable storage

### Blockchain Transparency

- All transactions are public on Solana blockchain
- NFT metadata is public on Arweave
- Consider privacy implications before uploading

## Incident Response

### In Case of Compromise

1. **Immediate Actions:**
   - Rotate compromised keys immediately
   - Revoke affected API keys
   - Notify users if necessary
   - Document the incident

2. **Investigation:**
   - Identify scope of compromise
   - Review logs for unauthorized access
   - Assess potential damage
   - Implement fixes

3. **Recovery:**
   - Deploy patched version
   - Monitor for further issues
   - Update security documentation
   - Conduct post-mortem

### Emergency Contacts

- Technical Lead: [contact@descireviews.com]
- Security Team: [security@descireviews.com]
- Vercel Support: support@vercel.com
- Solana Security: security@solana.com

## Backup and Recovery

### Critical Backups

1. **Mainnet Keypair** (multiple secure locations):
   - Encrypted USB drive
   - Password manager (encrypted)
   - Paper backup (fireproof safe)

2. **Environment Variables:**
   - Encrypted backup file
   - Documented in secure location
   - Accessible to team leads only

3. **Collection Addresses:**
   - Document all collection addresses
   - Store with keypair backups
   - Include network information

### Recovery Procedures

**Lost Keypair:**
- Use backup keypair
- Update Vercel environment variables
- Fund new keypair
- Update Irys configuration

**Compromised API Key:**
- Revoke on provider dashboard
- Generate new key
- Update environment variables
- Redeploy application

## Security Updates

This security policy is reviewed quarterly and updated as needed.

**Last Updated:** October 28, 2024  
**Next Review:** January 28, 2025

---

**Remember: Security is everyone's responsibility. When in doubt, ask questions and prioritize safety over speed.**
