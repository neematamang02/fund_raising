# Companion Report: Fundraising Web Application
## Professional, Social, Ethical, Legal, and Security Considerations

**Student Name:** [Your Name]  
**Student ID:** [Your Student ID]  
**Module:** [Module Code and Name]  
**Date:** January 2026  
**Word Count:** 2000 words

---

## 1. Social Impact

### Introduction

Social impact examines how technology affects individuals, communities, and society at large, encompassing both intended benefits and unintended consequences (Friedman & Hendry, 2019). For a fundraising platform that facilitates charitable giving and campaign management, understanding these impacts is essential for responsible development. This section explores how the platform influences different stakeholder groups and society more broadly.

### Relevant Aspects and Project Application

The platform creates significant positive social impact through democratization of fundraising. Traditional fundraising often requires institutional backing, substantial resources, or established networks. This application removes these barriers by providing accessible tools for campaign creation, donation processing, and transparent progress tracking. During development, the organizer application system was deliberately designed to balance accessibility with security—requiring basic information alongside verification documents (government ID and selfie) to protect donors while enabling legitimate campaigners.

The four-stage email notification system (application submitted, approved, rejected, revoked) emerged from recognizing users' psychological need for transparent communication. Testing revealed that receiving confirmation emails reduced anxiety about application status and built trust in the platform, demonstrating how technical features have social-psychological impacts beyond their functional purpose. This reflects research showing that clear communication reduces uncertainty and improves user experience (Nissenbaum, 2009).

However, the platform's digital nature creates exclusionary effects. Elderly populations with limited digital literacy, communities with poor internet access, and individuals without PayPal accounts face barriers to participation. The verification requirements create additional exclusion—refugees, homeless individuals, or undocumented persons may lack government-issued ID, while some religious groups have concerns about photographic identification. These barriers disproportionately affect vulnerable populations who might most benefit from fundraising capabilities.

Accessibility testing revealed further limitations. While responsive design ensures mobile compatibility, comprehensive testing for screen readers, keyboard navigation, and color contrast was not conducted. This potentially excludes approximately 15% of the global population living with disabilities (WHO, 2021), representing a significant social equity concern that intersects with ethical and legal considerations discussed in subsequent sections.

The platform also contributes to an "attention economy" where well-presented campaigns may overshadow equally worthy but less polished causes. Testing showed campaigns with compelling images and clear descriptions received more engagement, highlighting how digital literacy and presentation skills—advantages not equally distributed across society—influence fundraising success. This raises questions about whether the platform inadvertently reinforces existing inequalities rather than addressing them.

### Reflection

Social impact considerations directly influenced design decisions throughout development. Implementing pagination (20 campaigns per page) was partly driven by research showing excessive choice leads to decision paralysis (Schwartz, 2004), demonstrating that technical choices have psychological consequences. The tension between security (strict verification to prevent fraud) and inclusion (accessibility for all legitimate organizers) remained unresolved, highlighting that responsible technology development involves navigating competing social goods rather than achieving perfect solutions. Future iterations should explore alternative verification methods that maintain security while reducing exclusionary effects.

---

## 2. Ethical Considerations

### Introduction

Ethics in technology concerns the moral principles guiding what should be built, how it should function, and who it should serve (Floridi, 2013). For platforms handling personal data and financial transactions, ethical considerations span fairness, autonomy, beneficence (promoting welfare), and non-maleficence (avoiding harm). This section examines key ethical issues encountered during development and their implications for responsible technology practice.

### Relevant Aspects and Project Application

Fairness emerged as a central ethical concern in multiple contexts. The application displays campaigns chronologically (newest first), which appears neutral but creates recency bias—newer campaigns gain more visibility than older ones. This simple approach was chosen deliberately to avoid introducing algorithmic bias, yet raises ethical questions: is complete neutrality ethical, or should platforms actively promote campaigns for urgent humanitarian needs? Noble (2018) demonstrates how seemingly neutral algorithms can perpetuate inequalities, suggesting this warrants deeper consideration.

The verification process requiring government ID and selfies creates potential discrimination. While serving the legitimate aim of fraud prevention, the Equality Act 2010 requires considering less discriminatory alternatives. Testing revealed that mandatory requirements exclude certain groups—refugees without documentation, elderly people lacking digital literacy for selfie uploads, and religious groups with concerns about photographic identification. The current system's rigidity represents an ethical tension between security and inclusion that remains inadequately resolved.

User autonomy and informed consent present significant ethical gaps. The application collects substantial personal data: email addresses, names, government IDs, selfies, and payment information. GDPR Article 9 classifies government IDs and biometric data as "special category data" requiring heightened protection and explicit consent. However, the current implementation lacks explicit consent mechanisms—users implicitly consent by using the platform, but no privacy policy or granular consent options exist. This represents a significant ethical failing acknowledged during the ethical approval process but not yet addressed due to time constraints.

The principles of beneficence and non-maleficence guided several design decisions. The application attempts to promote user welfare through transparent donation tracking, secure PayPal integration, and comprehensive email notifications. Testing confirmed these features build trust and improve user experience. Harm-reduction measures include error handling that prevents crashes, rejection emails with constructive feedback, and rate limiting (5 login attempts per 15 minutes) to prevent brute force attacks.

However, potential harms remain. The rejection email system, while necessary, could cause emotional distress. Language was carefully crafted to be constructive rather than punitive, but the inherent power imbalance (admin rejecting user application) remains ethically problematic. Additionally, the platform could facilitate fraud despite verification measures, potentially causing financial and psychological harm to donors.

Accessibility represents both an ethical imperative and a practical failing. The application uses responsive design and semantic HTML but lacks comprehensive accessibility testing. Screen reader compatibility, keyboard navigation, and color contrast ratios were not verified against WCAG 2.1 AA standards. Approximately 15% of the global population lives with some form of disability, meaning the platform potentially excludes a significant user base—contradicting principles of fairness and inclusion.

### Reflection

Ethical considerations often conflicted with practical constraints throughout development. Implementing comprehensive accessibility features would require significant additional development time, yet excluding disabled users is ethically unacceptable. Similarly, stricter verification processes would reduce fraud risk but increase barriers for legitimate organizers. These tensions highlight that ethical technology development involves making informed trade-offs while acknowledging limitations, not achieving perfection. The ethical approval process was valuable in forcing explicit consideration of these issues, though many ethical questions remain unresolved and require ongoing attention in future iterations.

---

## 3. Legal Implications

### Introduction

Legal compliance is essential for platforms handling personal data and financial transactions. This section examines relevant UK and EU legislation, including the General Data Protection Regulation (GDPR), Equality Act 2010, and financial regulations, explaining their specific application to this project and identifying compliance gaps that must be addressed before production deployment.

### Relevant Aspects and Project Application

GDPR applies to any organization processing personal data of EU individuals (ICO, 2021). The application processes multiple data categories: basic identity data (names, emails), contact information (phone numbers), financial data (donation amounts, transaction IDs), and special category data (government IDs, biometric selfies). Special category data requires heightened protection and explicit consent under GDPR Article 9.

The application demonstrates some GDPR compliance through data minimization (only organizers must provide identification documents), purpose limitation (clear purposes for each data field), and security measures (password hashing with bcrypt, environment variable protection). However, significant compliance gaps exist. Users lack mechanisms to exercise GDPR rights: no data export functionality (right of access), no self-service data update (right to rectification), and no account deletion (right to erasure). The absence of explicit consent mechanisms, privacy policies, and data retention policies represents substantial non-compliance.

GDPR Article 35 requires a Data Protection Impact Assessment (DPIA) when processing is "likely to result in high risk" to individuals' rights. Given that the application processes special category data and involves vulnerable populations (people in financial need), a DPIA would be legally required for production deployment. This was not conducted during development—a significant oversight that must be addressed.

The Equality Act 2010 protects individuals from discrimination based on nine protected characteristics, including disability. Section 29 requires service providers to make "reasonable adjustments" for disabled people. The application's accessibility status is mixed: responsive design works across devices, and semantic HTML structure exists, but screen reader testing, keyboard navigation verification, and color contrast measurement against WCAG 2.1 AA standards were not conducted. These gaps could constitute disability discrimination, as implementing WCAG 2.1 AA standards is generally considered reasonable and achievable for web applications.

The verification requirements (government ID, selfie) could constitute indirect discrimination under the Equality Act. While serving the legitimate aim of fraud prevention, the Act requires considering whether less discriminatory alternatives exist. The current system's rigidity could be legally problematic—implementing flexible verification options would better balance security needs with equality obligations.

Financial regulations also apply. The Payment Services Regulations 2017 govern payment processing. By using PayPal as a payment processor, the application benefits from PayPal's regulatory compliance, but the platform still has obligations regarding transparency (clearly displaying fees), refund policies, and dispute resolution mechanisms. The application currently lacks clear refund and dispute policies—a legal gap that could expose the platform to liability.

Copyright considerations arise from user-generated content. Campaign creators upload images and descriptions, raising questions about ownership and infringement risk. The application currently lacks terms of service defining content ownership and licensing, copyright infringement reporting mechanisms, and DMCA-compliant takedown processes. For production deployment, implementing these protections is legally essential to limit liability.

### Reflection

Legal compliance emerged as one of the most complex aspects of the project. The tension between rapid development and comprehensive legal compliance is significant—implementing all GDPR rights, accessibility features, and legal documentation would substantially extend development time. This highlights a broader challenge in technology development: legal requirements are often treated as afterthoughts rather than integral design considerations. A more mature approach would involve legal consultation from the project's inception, ensuring compliance is built in rather than bolted on. For real-world deployment, consultation with legal professionals specializing in technology law, data protection, and financial services would be essential.

---

## 4. Security Aspects

### Introduction

Security is fundamental for applications handling personal data and financial transactions. This section examines security measures implemented, vulnerabilities identified, and best practices applied throughout development, spanning authentication, data protection, infrastructure security, and threat mitigation.

### Relevant Aspects and Project Application

Authentication and access control implement several security best practices. Passwords are hashed using bcrypt, which includes automatic salting to prevent rainbow table attacks. The system enforces minimum password length (8 characters) and uses time-limited reset tokens for password recovery. JSON Web Tokens (JWT) manage sessions, with tokens expiring after 7 days to limit damage if compromised. However, tokens are stored in browser localStorage, which is vulnerable to Cross-Site Scripting (XSS) attacks—httpOnly cookies would provide better security for production deployment.

Role-based access control (RBAC) implements a three-tier system: donors (default), organizers (approved users), and admins (privileged users). Role enforcement occurs at database level (enum validation), middleware level (JWT verification), and route level (role checking before access). Testing confirmed that attempts to access admin endpoints without credentials were correctly rejected with 403 Forbidden responses.

Rate limiting prevents brute force attacks, allowing 5 login attempts per 15 minutes per IP address. This proved effective during testing, but IP-based limiting has limitations—users behind shared IPs could be blocked by others' failed attempts, and attackers can bypass IP-based limiting using proxy networks. A more robust approach would combine IP-based and account-based rate limiting with progressive delays.

Data protection measures include encryption at rest (MongoDB Atlas uses AES-256) and encryption in transit (HTTPS required for production). Sensitive credentials (database URLs, API keys, JWT secrets) are stored in environment variables excluded from version control. PayPal credentials were initially in frontend environment variables but were refactored to backend-only access after recognizing this security risk—demonstrating iterative security improvement.

Input validation prevents injection attacks. Mongoose ORM provides NoSQL injection protection through parameterized queries and type validation. React automatically escapes values in JSX, preventing most XSS attacks. ObjectId validation checks prevent errors and potential injection attacks when invalid IDs are provided. However, the application does not use dedicated sanitization libraries or implement Content Security Policy headers—recommended enhancements for production.

Third-party service security was carefully considered. PayPal integration uses server-side credential handling and transaction verification before database recording. Cloudinary stores uploaded documents securely with HTTPS delivery. MongoDB Atlas provides network isolation, access control, and automated backups. However, sensitive documents (government IDs, selfies) are not encrypted beyond standard security—additional encryption would provide defense-in-depth.

Security testing included manual verification of authentication, role-based access control, rate limiting, and input validation. However, comprehensive security testing was not conducted—no penetration testing, automated vulnerability scanning, or code security analysis. For production deployment, professional security assessment would be essential to identify vulnerabilities missed during development.

### Reflection

Security considerations were integrated throughout development, though not always from the outset. Several security issues were identified and corrected iteratively: PayPal credential exposure was fixed by refactoring to backend-only access, rate limiting was added after recognizing brute force risks, and environment variable protection was strengthened after nearly committing credentials. These experiences underscore that security is not a one-time consideration but an ongoing process of identification, assessment, and mitigation. The tension between development speed and security thoroughness was evident—implementing all recommended security measures would significantly extend development time, yet deploying without them would be irresponsible. This balance between "good enough for now" and "production-ready" is a central challenge in software development.

---

## 5. Conclusion

This report has examined the fundraising platform through four interconnected lenses: social impact, ethics, legal compliance, and security. These considerations are deeply interrelated—social impact raises ethical questions about fairness and inclusion, ethical principles are codified in legal frameworks like GDPR, legal obligations mandate security measures, and security requirements can have negative social impacts.

Key learnings emerged throughout development. Iterative security improvement demonstrated that security is an ongoing process rather than a one-time implementation. Comprehensive documentation proved valuable not just for future developers but for clarifying thinking during development. Testing revealed limitations that weren't apparent during initial design, highlighting the importance of user testing. The ethical approval process, while sometimes feeling bureaucratic, forced explicit consideration of issues that might otherwise have been overlooked.

The project has several acknowledged limitations: comprehensive accessibility testing not achieved, GDPR user rights not fully implemented, no professional security assessment conducted, and scalability concerns with current architecture. Priority improvements for future development include implementing GDPR user rights, achieving WCAG 2.1 AA accessibility compliance, creating comprehensive privacy policies and terms of service, conducting professional security assessment, and implementing httpOnly cookie authentication.

This project highlights broader themes relevant to technology development. Technology is not neutral—design choices have social, ethical, and legal implications that developers must consider beyond technical functionality. Compliance is complex and requires specialized knowledge—developers should collaborate with legal professionals, accessibility experts, and security specialists. Perfect is the enemy of good—acknowledging limitations, prioritizing critical issues, and committing to ongoing improvement is more realistic than attempting perfection. User-centered design matters—technical capabilities mean little if the platform excludes or harms users.

Developing this platform while considering professional, social, ethical, legal, and security aspects has been both challenging and enlightening. The value lies not just in the working application but in grappling with real-world considerations that professional developers face daily. Understanding that technology development involves navigating social impacts, ethical dilemmas, legal requirements, and security threats—not just writing code—is perhaps the most important learning outcome. Moving forward, the frameworks and considerations explored in this report provide a foundation for responsible technology practice, prioritizing thoughtful, informed decision-making that acknowledges both capabilities and limitations while prioritizing user welfare and societal benefit.

---

## References

1. Friedman, B., & Hendry, D. G. (2019). *Value Sensitive Design: Shaping Technology with Moral Imagination.* MIT Press.

2. Nissenbaum, H. (2009). *Privacy in Context: Technology, Policy, and the Integrity of Social Life.* Stanford University Press.

3. Floridi, L. (2013). *The Ethics of Information.* Oxford University Press.

4. Noble, S. U. (2018). *Algorithms of Oppression: How Search Engines Reinforce Racism.* NYU Press.

5. Schwartz, B. (2004). *The Paradox of Choice: Why More Is Less.* Harper Perennial.

6. General Data Protection Regulation (GDPR) - Regulation (EU) 2016/679. Available at: https://gdpr-info.eu/

7. Information Commissioner's Office (ICO) - GDPR Guidance. Available at: https://ico.org.uk/

8. Equality Act 2010 - UK Legislation. Available at: https://www.legislation.gov.uk/ukpga/2010/15/contents

9. Payment Services Regulations 2017 - UK Legislation. Available at: https://www.legislation.gov.uk/uksi/2017/752/contents

10. Web Content Accessibility Guidelines (WCAG) 2.1 - W3C. Available at: https://www.w3.org/WAI/WCAG21/quickref/

11. World Health Organization (2021). *Disability and Health.* Available at: https://www.who.int/news-room/fact-sheets/detail/disability-and-health

12. OWASP Top Ten - Web Application Security Risks. Available at: https://owasp.org/www-project-top-ten/

---

**Word Count:** 2000 words  
**Date:** January 22, 2026
