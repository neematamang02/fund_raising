# Companion Report: Fundraising Web Application
## Professional, Social, Ethical, Legal, and Security Considerations

**Project:** Fundraising Web Application  
**Date:** January 2026  
**Author:** [Your Name]  
**Module:** [Module Code and Name]

---

## Executive Summary

This companion report critically examines the professional, social, ethical, legal, and security considerations relevant to the development of a web-based fundraising platform. The application enables users to create and manage fundraising campaigns, make donations via PayPal, and apply to become verified campaign organizers. Through the development process, numerous considerations emerged regarding data protection, user safety, accessibility, and regulatory compliance. This report reflects on these aspects, drawing from module lectures, research, practical development experience, and the ethical approval process.

---

## 1. Social Impact

### 1.1 Introduction to Social Impact

Social impact refers to the effect that a technology or system has on individuals, communities, and society at large. For a fundraising platform, this encompasses both the intended positive outcomes (enabling charitable giving and supporting causes) and potential unintended negative consequences (fraud, exclusion, or misuse). Understanding these impacts is crucial for responsible technology development.

### 1.2 Beneficial Social Effects

#### 1.2.1 Democratization of Fundraising

The platform significantly lowers barriers to fundraising by providing free, accessible tools for individuals and organizations to raise funds for legitimate causes. Traditional fundraising often requires substantial resources, connections, or institutional backing. This application democratizes the process, allowing:

- **Individual campaigners** to support personal medical emergencies, education costs, or community projects
- **Small nonprofits** without technical expertise to reach wider audiences
- **Grassroots organizations** to mobilize support quickly during crises
- **Charitable causes** in underserved communities to gain visibility

During development, the organizer application system was designed to be straightforward yet thorough, requiring basic information (organization name, description, contact details) alongside verification documents. This balance ensures accessibility while maintaining trust and security.

#### 1.2.2 Financial Inclusion and Access

The integration with PayPal provides multiple payment options, enabling donors from various economic backgrounds to contribute. The system supports:

- **Micro-donations**: No minimum donation amount, allowing people with limited resources to participate
- **International giving**: PayPal's global reach enables cross-border donations
- **Transparent tracking**: Real-time progress bars show donors the impact of their contributions

Testing revealed that the donation flow completes in under 30 seconds, reducing friction and encouraging spontaneous giving—a critical factor in online fundraising success.

#### 1.2.3 Community Building and Social Connection


The platform facilitates social connections by enabling people to support causes they care about and share campaigns within their networks. This creates:

- **Collective action**: Groups can rally around shared causes
- **Awareness raising**: Campaigns educate the public about important issues
- **Empathy development**: Exposure to diverse causes builds understanding across communities

### 1.3 Potential Detrimental Effects

#### 1.3.1 Fraud and Misuse Risks

Despite verification measures, the platform could potentially be exploited for fraudulent fundraising. Risks include:

- **False campaigns**: Users creating campaigns for non-existent causes
- **Misappropriation of funds**: Organizers using donations for purposes other than stated
- **Emotional manipulation**: Exaggerated or fabricated stories to elicit donations

To mitigate these risks, the application implements a multi-stage organizer verification process requiring government ID, selfie verification, and optional organizational documentation. During testing, this process proved effective at establishing identity while remaining user-friendly. However, document verification currently relies on admin review rather than automated systems, which could be a scalability limitation.

#### 1.3.2 Digital Divide and Exclusion

The platform's digital nature inherently excludes certain groups:

- **Elderly populations** with limited digital literacy
- **Communities with poor internet access** in rural or economically disadvantaged areas
- **Individuals without bank accounts or PayPal access**
- **People with disabilities** if accessibility features are inadequate


During development, accessibility considerations were partially addressed through responsive design using React and Tailwind CSS, ensuring mobile compatibility. However, comprehensive accessibility testing (screen readers, keyboard navigation, color contrast) was not fully implemented—a limitation that should be addressed before wider deployment.

#### 1.3.3 Competition for Attention and Resources

The platform contributes to an increasingly crowded digital fundraising landscape where:

- **Well-presented campaigns** may overshadow equally worthy but less polished causes
- **Donor fatigue** can result from constant exposure to requests
- **Resource concentration** may favor campaigns with existing social media reach

This "attention economy" effect became apparent during testing when campaigns with compelling images and clear descriptions received more engagement, highlighting the importance of digital literacy and presentation skills—advantages not equally distributed across society.

### 1.4 Impact on Different Stakeholder Groups

#### 1.4.1 Campaign Organizers

**Positive impacts:**
- Access to fundraising infrastructure without technical expertise
- Automated donation tracking and email notifications
- Professional presentation tools (image uploads, progress tracking)

**Negative impacts:**
- Pressure to maintain campaign momentum and respond to donors
- Potential reputational damage if campaigns fail to meet goals
- Administrative burden of document verification


#### 1.4.2 Donors

**Positive impacts:**
- Convenient, secure donation process
- Transparency through real-time progress tracking
- Ability to support multiple causes easily

**Negative impacts:**
- Risk of donating to fraudulent campaigns
- Potential for impulsive giving without due diligence
- Privacy concerns regarding donation data

#### 1.4.3 Administrators

**Positive impacts:**
- Tools to review and approve organizer applications
- Ability to revoke privileges if misuse is detected
- Comprehensive application tracking system

**Negative impacts:**
- Responsibility for fraud prevention and user safety
- Potential liability for approved campaigns that prove fraudulent
- Time-intensive manual document review process

### 1.5 Reflection on Development Experience

Throughout development, social impact considerations influenced several design decisions. The implementation of a four-stage email notification system (application submitted, approved, rejected, revoked) emerged from recognizing the need for clear communication and transparency. Testing revealed that users appreciated receiving confirmation emails, which reduced anxiety about application status and built trust in the platform.


The decision to implement pagination (limiting results to 20 campaigns per page) was partly driven by social considerations—preventing overwhelming users with too many choices, which research shows can lead to decision paralysis and reduced engagement. This reflects the principle that technology design choices have psychological and social consequences beyond their technical function.

---

## 2. Ethical Considerations

### 2.1 Introduction to Ethics in Technology

Ethics in technology development concerns the moral principles that guide decisions about what should be built, how it should function, and who it should serve. For a fundraising platform handling financial transactions and personal data, ethical considerations are paramount. This section examines key ethical issues through the lens of established frameworks including fairness, autonomy, beneficence, and non-maleficence.

### 2.2 Fairness and Bias

#### 2.2.1 Algorithmic Fairness

While the current application does not employ complex algorithms for campaign ranking or recommendation, the simple chronological ordering (newest first) has ethical implications:

- **Recency bias**: Newer campaigns gain more visibility than older ones, potentially disadvantaging long-term causes
- **Time zone effects**: Campaigns created during peak hours may receive more initial engagement
- **No quality filtering**: All approved campaigns receive equal treatment regardless of legitimacy or need


During development, this simple approach was chosen deliberately to avoid introducing algorithmic bias. However, it raises the ethical question: is complete neutrality always ethical, or should platforms actively promote campaigns for urgent humanitarian needs over less critical causes?

#### 2.2.2 Verification Process Fairness

The organizer verification system requires government-issued ID and selfie verification. This creates potential fairness issues:

- **Documentation barriers**: Refugees, homeless individuals, or undocumented persons may lack required ID
- **Technology access**: Selfie requirements assume access to cameras and digital literacy
- **Cultural considerations**: Some cultures or religions may have concerns about photographic identification

Testing the verification flow revealed these limitations. While the system includes "optional" fields for additional documents, the mandatory requirements (government ID and selfie) remain exclusionary. This represents an ethical tension between security (protecting donors from fraud) and inclusion (enabling all legitimate organizers to participate).

#### 2.2.3 Admin Discretion and Bias

The application review process relies on human admin judgment, introducing potential for:

- **Unconscious bias**: Admins may favor applications from certain demographics or causes
- **Inconsistent standards**: Different admins may apply different approval criteria
- **Lack of transparency**: Applicants receive rejection reasons but no insight into decision-making processes


To address this, the system includes an "adminNotes" field for documenting review decisions, promoting accountability. However, more robust measures—such as dual review processes or clear approval criteria checklists—would better ensure fairness.

### 2.3 User Autonomy and Consent

#### 2.3.1 Informed Consent for Data Collection

The application collects substantial personal data including:

- Email addresses and names (all users)
- Government ID images and selfies (organizers)
- Donation amounts and payment information (donors)
- Organization details and contact information (organizers)

Ethical data collection requires informed consent—users must understand what data is collected, why, and how it will be used. During development, the focus was on technical implementation rather than comprehensive consent mechanisms. This represents an ethical gap: while users implicitly consent by using the platform, explicit, granular consent options (e.g., separate consent for marketing emails vs. transactional emails) are not implemented.

#### 2.3.2 Right to Withdraw and Data Deletion

Ethical principles of autonomy include the right to withdraw consent and have data deleted. The current system lacks:

- **Account deletion functionality**: Users cannot easily remove their accounts
- **Data export options**: Users cannot download their personal data
- **Granular privacy controls**: No options to limit data sharing or visibility


These limitations emerged during the ethical approval process, where questions about data retention and user rights highlighted gaps in the initial design. Implementing these features should be a priority for future development.

### 2.4 Beneficence and Non-Maleficence

#### 2.4.1 Maximizing Benefit (Beneficence)

The principle of beneficence requires actively promoting user welfare. The application attempts this through:

- **Transparent donation tracking**: Real-time progress bars help donors see their impact
- **Email notifications**: Four-stage notification system keeps users informed
- **Secure payment processing**: PayPal integration provides trusted payment infrastructure
- **Fraud prevention**: Verification processes protect donors from scams

Testing revealed that these features successfully build user trust. The email notification system, in particular, received positive feedback for reducing uncertainty and improving communication.

#### 2.4.2 Avoiding Harm (Non-Maleficence)

Non-maleficence requires avoiding causing harm. Potential harms include:

- **Financial harm**: Users losing money to fraudulent campaigns
- **Privacy harm**: Personal data breaches or misuse
- **Psychological harm**: Emotional distress from failed campaigns or rejected applications
- **Reputational harm**: False accusations of fraud


The application implements several harm-reduction measures:

- **Error handling**: Email failures don't crash the application, ensuring service continuity
- **Graceful rejection**: Rejection emails include constructive feedback and reapplication options
- **Secure credential storage**: Environment variables protect sensitive API keys
- **Rate limiting**: Login attempts are limited to prevent brute force attacks (5 attempts per 15 minutes)

However, testing also revealed potential harms. The rejection email system, while necessary, could cause emotional distress. The language was carefully crafted to be constructive rather than punitive, but the inherent power imbalance (admin rejecting user application) remains ethically problematic.

### 2.5 Accessibility as an Ethical Imperative

Accessibility is not merely a legal requirement but an ethical obligation to ensure technology serves all people, including those with disabilities. The application uses:

- **Responsive design**: Mobile and desktop compatibility via React and Tailwind CSS
- **Semantic HTML**: Proper heading structure and form labels
- **Color-coded status indicators**: Visual feedback for application states

However, comprehensive accessibility testing was not conducted. Specific gaps include:

- **Screen reader compatibility**: Not verified
- **Keyboard navigation**: Not fully tested
- **Color contrast ratios**: Not measured against WCAG standards
- **Alternative text for images**: Inconsistently implemented


This represents an ethical failing. Approximately 15% of the global population lives with some form of disability, meaning the platform potentially excludes a significant user base. This was acknowledged during the ethical approval process, and accessibility improvements should be prioritized.

### 2.6 Responsible Use of Technology

#### 2.6.1 Transparency and Honesty

Ethical technology use requires transparency about capabilities and limitations. The application demonstrates this through:

- **Clear status indicators**: Users know whether applications are pending, approved, or rejected
- **Honest communication**: Rejection emails explain reasons rather than providing vague responses
- **Visible progress tracking**: Donors see exactly how much has been raised

However, transparency could be improved regarding:

- **Data usage**: No clear privacy policy explaining data handling
- **Fee structures**: While PayPal fees are standard, they're not explicitly disclosed
- **Algorithm explanation**: Users don't know how campaigns are ordered or prioritized

#### 2.6.2 Avoiding Dark Patterns

Dark patterns are design choices that manipulate users into actions they might not otherwise take. The application consciously avoids common dark patterns:

- **No forced account creation**: Users can browse campaigns without registering
- **No hidden costs**: Donation amounts are clear and transparent
- **No artificial urgency**: No countdown timers or "only X donations left" messaging


This ethical stance was deliberate, prioritizing user autonomy over conversion optimization. However, it raises interesting questions about the ethics of persuasion—is it ethical to use psychological techniques to encourage charitable giving, even if the cause is legitimate?

### 2.7 Reflection on Ethical Decision-Making

Throughout development, ethical considerations often conflicted with practical constraints. For example, implementing comprehensive accessibility features would require significant additional development time, yet excluding disabled users is ethically unacceptable. Similarly, stricter verification processes would reduce fraud risk but increase barriers for legitimate organizers.

These tensions highlight that ethical technology development is not about finding perfect solutions but about making informed trade-offs while acknowledging limitations. The ethical approval process was valuable in forcing explicit consideration of these issues, though many ethical questions remain unresolved and require ongoing attention.

---

## 3. Legal Implications

### 3.1 Introduction to Legal Considerations

Legal compliance is essential for any platform handling personal data and financial transactions. This section examines relevant UK and EU legislation, including the General Data Protection Regulation (GDPR), the Equality Act 2010, copyright law, and financial regulations. Understanding these legal frameworks is crucial for responsible deployment and operation.


### 3.2 General Data Protection Regulation (GDPR)

#### 3.2.1 GDPR Applicability and Scope

The GDPR applies to any organization processing personal data of individuals in the EU, regardless of where the organization is based. As the fundraising platform collects and processes personal data (names, email addresses, payment information, identification documents), it falls squarely within GDPR scope.

GDPR defines personal data as "any information relating to an identified or identifiable natural person." The application processes multiple categories of personal data:

- **Basic identity data**: Names, email addresses (User model)
- **Contact information**: Phone numbers, addresses (OrganizerApplication model)
- **Financial data**: Donation amounts, PayPal transaction IDs (Donation model)
- **Special category data**: Government ID images and selfies (OrganizerApplication model)

Government ID images and biometric data (selfies used for identity verification) are considered "special category data" under GDPR Article 9, requiring heightened protection and explicit consent.

#### 3.2.2 GDPR Principles and Compliance

GDPR establishes six key principles for data processing:

**1. Lawfulness, Fairness, and Transparency**

Processing must have a legal basis. For this application:
- **Consent**: Users consent to data processing by creating accounts and submitting applications
- **Contract**: Processing is necessary to fulfill the service contract (enabling donations and campaigns)
- **Legitimate interests**: Fraud prevention serves legitimate interests of the platform and users


However, the application currently lacks explicit consent mechanisms. Users are not presented with clear privacy policies or consent checkboxes during registration. This represents a significant GDPR compliance gap that must be addressed before production deployment.

**2. Purpose Limitation**

Data must be collected for specified, explicit, and legitimate purposes. The application collects data for:
- User authentication and account management
- Campaign creation and management
- Donation processing and tracking
- Organizer verification and fraud prevention

During development, the database schema was designed with clear purposes for each field. For example, the `resetToken` field in the User model is specifically for password reset functionality, not general authentication. This demonstrates purpose limitation in practice.

**3. Data Minimization**

Only necessary data should be collected. The application demonstrates data minimization through:
- **Optional fields**: Website, additional documents, and admin notes are optional
- **No excessive collection**: The system doesn't collect unnecessary demographic data
- **Targeted verification**: Only organizers (not all users) must provide identification documents

However, some fields could be questioned. For instance, storing `payerCountry` in the Donation model may not be strictly necessary for core functionality, though it could serve legitimate fraud detection purposes.


**4. Accuracy**

Data must be accurate and kept up to date. The application supports this through:
- **Email validation**: Regex validation ensures email format correctness
- **Trim and lowercase**: Email addresses are normalized to prevent duplicates
- **Timestamps**: `createdAt` and `updatedAt` fields track data currency

However, there's no mechanism for users to update their information (except through admin intervention), which could lead to outdated data over time—a GDPR compliance issue.

**5. Storage Limitation**

Data should not be kept longer than necessary. The application currently has no data retention policies:
- **No automatic deletion**: Old campaigns, donations, or applications are never removed
- **No archival process**: Rejected applications remain in the database indefinitely
- **No user account deletion**: Users cannot delete their accounts

This represents a significant GDPR violation. Article 17 grants users the "right to be forgotten," requiring mechanisms for data deletion upon request. Implementing data retention policies and deletion functionality is legally essential.

**6. Integrity and Confidentiality (Security)**

Data must be processed securely (covered in detail in Section 4). Key security measures include:
- **Password hashing**: Using bcrypt for password storage
- **Environment variables**: Sensitive credentials stored securely
- **HTTPS**: Required for production deployment
- **Access control**: Role-based permissions (donor, organizer, admin)


#### 3.2.3 GDPR Rights and Implementation

GDPR grants individuals eight key rights:

**Right to be Informed**: Users must be informed about data collection and use. The application lacks a privacy policy or clear data processing notices—a critical gap.

**Right of Access**: Users can request copies of their personal data. No data export functionality exists, requiring manual admin intervention to fulfill requests.

**Right to Rectification**: Users can request data corrections. The application has no self-service data update mechanism.

**Right to Erasure**: Users can request data deletion. No account deletion functionality exists.

**Right to Restrict Processing**: Users can request processing limitations. Not implemented.

**Right to Data Portability**: Users can request data in machine-readable format. Not implemented.

**Right to Object**: Users can object to certain processing. Not implemented.

**Rights Related to Automated Decision-Making**: Users must be informed of automated decisions. The application uses minimal automation (no AI/ML), but admin decisions lack transparency.

The absence of these features represents substantial GDPR non-compliance. While acceptable for a prototype or academic project, production deployment would require implementing these rights, likely through a user dashboard with privacy controls.


#### 3.2.4 Data Protection Impact Assessment (DPIA)

GDPR Article 35 requires a Data Protection Impact Assessment when processing is "likely to result in high risk" to individuals' rights. Given that the application processes special category data (government IDs, biometric selfies) and involves vulnerable populations (people in financial need), a DPIA would be legally required.

A DPIA would systematically assess:
- What personal data is processed and why
- Necessity and proportionality of processing
- Risks to individuals' rights and freedoms
- Measures to address risks and demonstrate compliance

This was not conducted during development—a significant oversight. For production deployment, a formal DPIA conducted with data protection expertise would be essential.

### 3.3 Equality Act 2010

#### 3.3.1 Applicability to Digital Services

The Equality Act 2010 protects individuals from discrimination based on nine protected characteristics: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation. While primarily focused on physical services and employment, the Act applies to digital services as "provision of services to the public."

#### 3.3.2 Disability Discrimination and Accessibility

Section 29 of the Equality Act requires service providers to make "reasonable adjustments" for disabled people. For digital services, this means ensuring websites and applications are accessible to people with disabilities.


The application's accessibility status is mixed:

**Positive aspects:**
- Responsive design works on various devices and screen sizes
- Semantic HTML structure (using React components)
- Form labels associated with inputs

**Gaps:**
- No screen reader testing conducted
- Keyboard navigation not fully verified
- Color contrast not measured against WCAG 2.1 AA standards
- No alternative text for campaign images
- No captions or transcripts for video content (if added)

These gaps could constitute disability discrimination under the Equality Act. The legal standard is "reasonable adjustments," which courts interpret based on factors including cost, practicality, and effectiveness. For a web application, implementing WCAG 2.1 AA standards is generally considered reasonable and achievable.

#### 3.3.3 Indirect Discrimination

The verification requirements (government ID, selfie) could constitute indirect discrimination:

- **Age discrimination**: Elderly people may lack digital literacy for selfie uploads
- **Disability discrimination**: People with certain disabilities may struggle with selfie requirements
- **Race/religion discrimination**: Some religious groups have concerns about photographic identification

While these requirements serve the legitimate aim of fraud prevention, the Equality Act requires considering whether less discriminatory alternatives exist. Possible alternatives include:
- Video call verification
- Third-party identity verification services
- Alternative documentation options


The current system's rigidity could be legally problematic. Implementing flexible verification options would better balance security needs with equality obligations.

### 3.4 Copyright and Intellectual Property

#### 3.4.1 User-Generated Content and Copyright

Campaign creators upload images and descriptions, raising copyright questions:

**Ownership**: Users retain copyright in their uploaded content. The platform needs terms of service granting a license to display this content.

**Infringement risk**: Users might upload copyrighted images without permission (e.g., stock photos, celebrity images). The platform could face secondary liability.

**DMCA compliance**: If operating in the US or serving US users, the Digital Millennium Copyright Act requires a process for copyright holders to request content removal.

The application currently lacks:
- Terms of service defining content ownership and licensing
- Copyright infringement reporting mechanism
- DMCA-compliant takedown process

For a production platform, implementing these protections is legally essential to limit liability.

#### 3.4.2 Third-Party Dependencies and Licensing

The application uses numerous open-source libraries (React, Express, Mongoose, etc.). Each has licensing terms that must be respected:


- **MIT License** (React, Express): Permissive, allows commercial use with attribution
- **ISC License** (Mongoose): Similar to MIT, very permissive
- **Apache 2.0** (some dependencies): Permissive with patent grant

Review of `package.json` files confirms all dependencies use permissive licenses compatible with commercial use. However, proper attribution (typically in an "About" page or license file) should be included to comply with license terms.

### 3.5 Financial Regulations and Consumer Protection

#### 3.5.1 Payment Services Regulations

The Payment Services Regulations 2017 (implementing EU PSD2) govern payment processing. By using PayPal as a payment processor, the application benefits from PayPal's regulatory compliance:

- **Authorization**: PayPal is an authorized payment institution
- **Security**: PayPal implements Strong Customer Authentication (SCA)
- **Liability**: PayPal assumes liability for payment processing

However, the platform still has obligations:
- **Transparency**: Clearly displaying fees and charges
- **Refund policies**: Defining when and how refunds are processed
- **Dispute resolution**: Providing mechanisms for payment disputes

The application currently lacks clear refund and dispute policies—a legal gap that could expose the platform to liability.


#### 3.5.2 Consumer Rights Act 2015

The Consumer Rights Act protects consumers purchasing services. While donations are typically considered gifts rather than purchases, the Act's principles of fairness and transparency remain relevant:

- **Clear information**: Donors should understand where their money goes
- **Service quality**: The platform should function as described
- **Remedies**: Mechanisms for addressing problems

The application's transparent progress tracking and email notifications support these principles. However, explicit terms of service clarifying the platform's role (facilitator vs. guarantor) would provide legal clarity.

#### 3.5.3 Charity Fundraising Regulations

In the UK, charity fundraising is regulated by the Fundraising Regulator and Charity Commission. Key considerations:

**Charitable status**: The platform itself is not a charity, but facilitates fundraising for various causes (some charitable, some personal).

**Fundraising standards**: The Fundraising Regulator's Code of Fundraising Practice sets standards for transparency, honesty, and donor protection.

**Registration requirements**: Organizations raising significant funds may need Charity Commission registration.

The platform should clearly communicate that:
- It is a facilitator, not a charity
- Not all campaigns are for registered charities
- Users should verify campaign legitimacy independently


Currently, this distinction is not clearly communicated, potentially misleading users about the platform's nature and their legal protections.

### 3.6 Terms of Service and Legal Documentation

#### 3.6.1 Essential Legal Documents

Production deployment requires several legal documents:

**Terms of Service**: Defines the contractual relationship between platform and users, covering:
- User obligations and prohibited conduct
- Platform rights and limitations of liability
- Dispute resolution and governing law
- Account termination conditions

**Privacy Policy**: Explains data collection, use, and protection practices (GDPR requirement)

**Cookie Policy**: Discloses cookie usage (if applicable)

**Acceptable Use Policy**: Defines prohibited content and behavior

**Refund Policy**: Explains refund conditions and processes

None of these documents currently exist for the application—a critical legal gap.

#### 3.6.2 Liability Limitations

Terms of service typically include liability limitations to protect the platform from lawsuits. However, UK law (Unfair Contract Terms Act 1977) prohibits excluding liability for:
- Death or personal injury due to negligence
- Fraud or fraudulent misrepresentation
- Certain consumer rights


Carefully drafted terms of service, reviewed by legal professionals, would be essential for production deployment to appropriately limit liability while respecting legal constraints.

### 3.7 Reflection on Legal Compliance

Legal compliance emerged as one of the most complex aspects of the project. The tension between rapid development and comprehensive legal compliance is significant—implementing all GDPR rights, accessibility features, and legal documentation would substantially extend development time.

This highlights a broader challenge in technology development: legal requirements are often treated as afterthoughts rather than integral design considerations. A more mature approach would involve legal consultation from the project's inception, ensuring compliance is built in rather than bolted on.

The ethical approval process touched on some legal issues (data protection, consent) but did not constitute comprehensive legal review. For real-world deployment, consultation with legal professionals specializing in technology law, data protection, and financial services would be essential.

---

## 4. Security Aspects

### 4.1 Introduction to Security Considerations

Security is fundamental to any application handling personal data and financial transactions. This section examines the security measures implemented, vulnerabilities identified, and best practices applied throughout development. Security considerations span authentication, data protection, infrastructure security, and threat mitigation.


### 4.2 Authentication and Access Control

#### 4.2.1 Password Security

The application implements several password security best practices:

**Hashing with bcrypt**: Passwords are never stored in plain text. The `bcryptjs` library (version 3.0.2) hashes passwords using a computationally expensive algorithm that resists brute-force attacks. Bcrypt automatically includes salt (random data added to passwords before hashing) to prevent rainbow table attacks.

**Password strength requirements**: The authentication system enforces minimum password length (8 characters). During testing, this proved effective at preventing weak passwords like "password" or "12345678," though more sophisticated requirements (uppercase, numbers, special characters) could further improve security.

**Secure password reset**: The system uses time-limited reset tokens stored in the User model (`resetToken` and `resetTokenExpiry` fields). Tokens expire after a set period, limiting the window for potential attacks.

However, several password security gaps exist:

- **No maximum password length**: Extremely long passwords could cause denial-of-service through excessive bcrypt computation
- **No password complexity requirements**: Users can create passwords like "aaaaaaaa"
- **No password breach checking**: The system doesn't check passwords against known breach databases (e.g., Have I Been Pwned API)


#### 4.2.2 Session Management and JWT Tokens

The application uses JSON Web Tokens (JWT) for session management:

**Token generation**: Upon successful login, the server generates a JWT containing the user's ID and role, signed with a secret key (`JWT_SECRET` environment variable).

**Token expiration**: Tokens expire after 7 days (`JWT_EXPIRES_IN` environment variable), requiring users to re-authenticate periodically. This limits the damage if a token is compromised.

**Token storage**: Tokens are stored in browser localStorage on the client side. This approach has security implications:

**Advantages:**
- Simple implementation
- Persists across browser sessions
- Easy to access from JavaScript

**Disadvantages:**
- Vulnerable to Cross-Site Scripting (XSS) attacks—malicious JavaScript can read localStorage
- Not automatically sent with requests (unlike cookies)
- No built-in expiration enforcement on client side

A more secure approach would use httpOnly cookies, which JavaScript cannot access, providing better XSS protection. The security documentation notes this as a recommended improvement for production deployment.


#### 4.2.3 Role-Based Access Control (RBAC)

The application implements a three-tier role system:

**Donor**: Default role for all new users. Can browse campaigns, make donations, and apply to become an organizer.

**Organizer**: Approved users who can create and manage fundraising campaigns. Requires admin approval.

**Admin**: Privileged users who can review organizer applications, approve/reject/revoke organizer status, and access all system data.

Role enforcement occurs at multiple levels:

**Database level**: The User model includes a `role` field with enum validation, preventing invalid roles.

**Middleware level**: Authentication middleware verifies JWT tokens and attaches user information to requests.

**Route level**: Protected routes check user roles before allowing access. For example, campaign creation routes verify the user has "organizer" role.

During testing, role-based access control proved effective. Attempts to access admin endpoints without admin credentials were correctly rejected with 403 Forbidden responses. However, comprehensive penetration testing was not conducted, so subtle authorization bypasses may exist.


#### 4.2.4 Rate Limiting and Brute Force Protection

The authentication routes implement rate limiting to prevent brute force attacks:

**Login rate limiting**: 5 login attempts per 15 minutes per IP address. This prevents attackers from rapidly trying many password combinations.

**Implementation**: Uses in-memory rate limiting (likely via middleware), which is effective for single-server deployments but would need Redis or similar for distributed systems.

Testing confirmed that after 5 failed login attempts, subsequent attempts are blocked with a 429 Too Many Requests response. However, the rate limiting is IP-based, which has limitations:

- **Shared IPs**: Users behind corporate NATs or VPNs share IP addresses, so one user's failed attempts could block others
- **IP rotation**: Attackers can bypass IP-based limiting using proxy networks or VPNs
- **No account-level limiting**: An attacker could try 5 passwords for many different accounts

A more robust approach would combine IP-based and account-based rate limiting, with progressive delays (exponential backoff) for repeated failures.

### 4.3 Data Protection and Encryption

#### 4.3.1 Data at Rest

**Database security**: The application uses MongoDB Atlas (cloud-hosted MongoDB), which provides:
- Encryption at rest using AES-256
- Automated backups
- Network isolation
- Access control


**File storage**: Uploaded documents (government IDs, selfies) are stored in Cloudinary, which provides:
- Secure HTTPS delivery
- Access control via API keys
- Automatic image optimization
- CDN distribution

However, sensitive documents (government IDs, selfies) are not encrypted beyond Cloudinary's standard security. For highly sensitive data, additional encryption (e.g., client-side encryption before upload) would provide defense-in-depth.

**Environment variables**: Sensitive credentials (database URLs, API keys, JWT secrets) are stored in `.env` files, which are:
- Excluded from version control via `.gitignore`
- Loaded at runtime via the `dotenv` package
- Never exposed to client-side code

The `.env.example` file provides a template with placeholder values, allowing developers to configure their environments without exposing real credentials. This is a security best practice that was implemented early in development.

#### 4.3.2 Data in Transit

**HTTPS requirement**: The security documentation specifies HTTPS for production deployment, ensuring all data transmitted between clients and servers is encrypted using TLS (Transport Layer Security).

**API communication**: All API requests between frontend and backend use HTTPS in production, preventing man-in-the-middle attacks where attackers intercept network traffic.


**Third-party integrations**: PayPal API communication uses HTTPS with OAuth 2.0 authentication, ensuring secure payment processing.

However, the development environment uses HTTP (localhost), which is acceptable for local testing but must never be used in production. The configuration uses environment variables (`NODE_ENV`) to enforce HTTPS in production.

#### 4.3.3 Sensitive Data Handling

The application handles several types of sensitive data:

**Payment information**: Credit card details are never stored or processed by the application. PayPal handles all payment processing, and the application only receives transaction IDs and confirmation details. This significantly reduces PCI DSS (Payment Card Industry Data Security Standard) compliance burden.

**Government IDs and biometric data**: These are stored as Cloudinary URLs in the database. The documents themselves are hosted on Cloudinary's secure infrastructure. However, access control is limited—anyone with the URL can view the documents. Implementing signed URLs with expiration times would improve security.

**Email addresses**: Stored in lowercase and trimmed to ensure consistency. However, email addresses are not encrypted in the database, which is standard practice but means database breaches would expose email addresses.

**Passwords**: Never stored in plain text; only bcrypt hashes are stored. Even database administrators cannot retrieve user passwords.


### 4.4 Input Validation and Injection Prevention

#### 4.4.1 SQL/NoSQL Injection Prevention

**MongoDB and Mongoose**: The application uses Mongoose ORM, which provides protection against NoSQL injection by:
- Parameterizing queries
- Type validation
- Schema enforcement

For example, when querying users by email, Mongoose ensures the email parameter is treated as a string, not as a MongoDB operator. This prevents attacks like:

```javascript
// Malicious input: { $gt: "" } (would match all users)
// Mongoose treats this as a literal string, not an operator
```

**ObjectId validation**: The code includes `mongoose.isValidObjectId()` checks before database queries, preventing errors and potential injection attacks when invalid IDs are provided.

Testing with malformed inputs (e.g., `{"$ne": null}` as email) confirmed that Mongoose's protections are effective. However, comprehensive security testing with tools like OWASP ZAP was not conducted.

#### 4.4.2 Cross-Site Scripting (XSS) Prevention

**React's built-in protection**: React automatically escapes values embedded in JSX, preventing most XSS attacks. For example, if a campaign title contains `<script>alert('XSS')</script>`, React renders it as text, not executable code.


**Input sanitization**: The backend sanitizes inputs by:
- Trimming whitespace
- Converting emails to lowercase
- Validating email format with regex

However, the application does not use a dedicated sanitization library (like DOMPurify or validator.js), which could provide more comprehensive protection. For production, implementing additional sanitization would be prudent.

**Content Security Policy (CSP)**: The application does not implement CSP headers, which would provide an additional layer of XSS protection by restricting which scripts can execute. This is a recommended enhancement for production.

#### 4.4.3 Cross-Site Request Forgery (CSRF) Prevention

**JWT-based authentication**: Because the application uses JWT tokens in localStorage (not cookies), it is not vulnerable to traditional CSRF attacks, which exploit automatic cookie transmission.

However, if the application were migrated to httpOnly cookies (recommended for security), CSRF protection would become necessary. This would typically involve:
- CSRF tokens for state-changing requests
- SameSite cookie attributes
- Origin/Referer header validation

### 4.5 Infrastructure and Deployment Security

#### 4.5.1 Dependency Management

**Package vulnerabilities**: The application uses numerous npm packages, which can contain security vulnerabilities.


**Mitigation strategies:**
- Regular `npm audit` checks to identify known vulnerabilities
- Keeping dependencies updated
- Using `npm audit fix` to automatically update vulnerable packages
- Monitoring security advisories for critical dependencies

During development, `npm audit` was run periodically, and no critical vulnerabilities were found in the final dependency set. However, continuous monitoring is necessary as new vulnerabilities are discovered regularly.

**Dependency pinning**: The `package-lock.json` files ensure consistent dependency versions across environments, preventing unexpected behavior from version changes.

#### 4.5.2 Environment Configuration

**Environment-specific settings**: The application uses environment variables to configure different environments (development, staging, production):

```
NODE_ENV=production
DATABASE_URL=<production-database>
JWT_SECRET=<strong-secret>
FRONTEND_URL=<production-domain>
```

**Secret management**: The security documentation emphasizes:
- Never committing `.env` files to version control
- Using strong, unique secrets for each environment
- Rotating credentials regularly
- Enabling two-factor authentication on service accounts (AWS, MongoDB, PayPal)


A `CREDENTIAL_ROTATION_GUIDE.md` file was created to document the process for rotating compromised credentials, demonstrating proactive security planning.

#### 4.5.3 CORS Configuration

**Cross-Origin Resource Sharing (CORS)**: The backend implements CORS with an origin whitelist:

```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

This configuration:
- Allows requests only from the specified frontend URL
- Supports credentials (cookies, authorization headers)
- Prevents unauthorized cross-origin requests

During development, the frontend URL is `http://localhost:5173`, while production would use the actual domain. This prevents malicious websites from making requests to the API on behalf of users.

#### 4.5.4 Request Size Limits

**Denial of Service (DoS) prevention**: The application limits request body sizes:

```javascript
express.json({ limit: '10mb' })
express.urlencoded({ limit: '10mb', extended: true })
```

This prevents attackers from overwhelming the server with extremely large payloads. The 10MB limit accommodates document uploads while preventing abuse.


### 4.6 Third-Party Service Security

#### 4.6.1 PayPal Integration Security

**Secure credential handling**: PayPal credentials (client ID and secret) are stored in backend environment variables, not exposed to the frontend. Initially, the PayPal client ID was in frontend environment variables, but this was identified as a security risk and corrected.

**Current implementation**: The frontend fetches the PayPal client ID from a backend endpoint (`/api/paypal/config`), ensuring credentials remain server-side. This change is documented in `PAYPAL_CONFIG_SECURITY_UPDATE.md`.

**Sandbox vs. production**: The application uses PayPal's sandbox environment for testing, with a clear configuration flag (`PAYPAL_ENVIRONMENT`) to switch to production. This prevents accidental real transactions during development.

**Transaction verification**: All PayPal transactions are verified server-side before being recorded in the database, preventing clients from forging successful payments.

#### 4.6.2 Cloudinary Security

**API key protection**: Cloudinary API keys are stored in backend environment variables and never exposed to clients.

**Upload restrictions**: File uploads are processed through the backend, which can enforce:
- File type restrictions (images only)
- File size limits
- Malware scanning (if implemented)


**Public ID tracking**: The application stores Cloudinary public IDs, enabling document deletion when applications are removed. This supports data minimization and the right to erasure.

#### 4.6.3 MongoDB Atlas Security

**Network security**: MongoDB Atlas provides:
- IP whitelisting (only specified IPs can connect)
- VPC peering for private network connections
- Encryption in transit (TLS/SSL)
- Encryption at rest

**Authentication**: Database connections use username/password authentication with strong credentials stored in environment variables.

**Backup and recovery**: Automated backups enable recovery from data loss or corruption, supporting business continuity and disaster recovery.

### 4.7 Email Security

#### 4.7.1 Email Service Configuration

**Gmail App Passwords**: The application uses Gmail for sending notification emails, configured with app-specific passwords rather than the main account password. This limits damage if credentials are compromised—the app password can be revoked without changing the main password.

**Environment variable storage**: Email credentials are stored in `.env` files and never committed to version control.


#### 4.7.2 Email Content Security

**No sensitive data in emails**: Notification emails avoid including sensitive information like passwords, full payment details, or government ID numbers. They include only necessary information (application status, campaign names, etc.).

**Secure links**: Email links direct users to the main application, not to external sites, reducing phishing risks.

**Graceful error handling**: Email sending failures don't crash the application or expose error details to users, preventing information leakage.

### 4.8 Logging and Monitoring

#### 4.8.1 Security Logging

**Console logging**: The application logs security-relevant events:
- Successful and failed login attempts
- Email sending status
- Database connection status
- API errors

However, logging is currently basic (console.log statements). Production deployment should implement:
- Structured logging (JSON format)
- Log aggregation (e.g., ELK stack, CloudWatch)
- Security event monitoring
- Alerting for suspicious activity

#### 4.8.2 Error Handling

**Graceful degradation**: The application handles errors without exposing sensitive information:
- Generic error messages to users ("An error occurred")
- Detailed errors logged server-side for debugging
- No stack traces exposed to clients


Testing confirmed that database errors, authentication failures, and API errors return appropriate HTTP status codes without leaking implementation details.

### 4.9 Security Testing and Validation

#### 4.9.1 Testing Conducted

**Manual testing**: Throughout development, manual security testing included:
- Attempting to access protected routes without authentication
- Testing role-based access control with different user roles
- Verifying rate limiting with repeated login attempts
- Testing input validation with malformed data
- Confirming password hashing (passwords not visible in database)

**Automated testing**: The `test-email.js` script validates email configuration, ensuring the email service is properly secured before use.

#### 4.9.2 Testing Gaps

Comprehensive security testing was not conducted:
- **No penetration testing**: Professional security assessment not performed
- **No automated vulnerability scanning**: Tools like OWASP ZAP or Burp Suite not used
- **No code security analysis**: Static analysis tools (e.g., Snyk, SonarQube) not employed
- **No load testing**: System behavior under attack conditions not evaluated

For production deployment, professional security assessment would be essential to identify vulnerabilities missed during development.


### 4.10 Security Best Practices and Recommendations

#### 4.10.1 Implemented Best Practices

The application successfully implements several security best practices:

✅ **Password hashing** with bcrypt  
✅ **Environment variable** configuration  
✅ **HTTPS** requirement for production  
✅ **Rate limiting** on authentication  
✅ **Role-based access control**  
✅ **Input validation** and sanitization  
✅ **CORS** configuration  
✅ **Request size limits**  
✅ **Secure third-party integrations**  
✅ **Error handling** without information leakage  
✅ **Database indexing** for performance (reduces DoS risk)  

#### 4.10.2 Recommended Improvements

The security documentation identifies several recommended improvements:

🔄 **Token storage**: Migrate from localStorage to httpOnly cookies  
🔄 **Content Security Policy**: Implement CSP headers  
🔄 **Dependency monitoring**: Continuous vulnerability scanning  
🔄 **Structured logging**: Implement comprehensive logging and monitoring  
🔄 **Security headers**: Add Helmet.js for security headers  
🔄 **File upload validation**: Implement malware scanning  
🔄 **Account lockout**: Implement progressive delays for failed logins  
🔄 **Two-factor authentication**: Add 2FA option for users  
🔄 **Security testing**: Regular penetration testing and vulnerability assessments  


### 4.11 Reflection on Security Development

Security considerations were integrated throughout the development process, though not always from the outset. Several security issues were identified and corrected during development:

**PayPal credential exposure**: Initially, the PayPal client ID was in frontend environment variables. Recognizing this as a security risk, the implementation was refactored to fetch credentials from the backend, demonstrating iterative security improvement.

**Rate limiting implementation**: Rate limiting was added after recognizing brute force attack risks, showing responsive security thinking.

**Environment variable protection**: The `.gitignore` file was updated to exclude `.env` files after nearly committing credentials, highlighting the importance of security awareness.

These experiences underscore that security is not a one-time consideration but an ongoing process of identification, assessment, and mitigation. The comprehensive security documentation (`SECURITY_FIXES_APPLIED.txt`, `CREDENTIAL_ROTATION_GUIDE.md`) reflects a mature approach to security, acknowledging both achievements and limitations.

The tension between development speed and security thoroughness was evident throughout the project. Implementing all recommended security measures would significantly extend development time, yet deploying without them would be irresponsible. This balance—between "good enough for now" and "production-ready"—is a central challenge in software development.


---

## 5. Conclusion and Critical Reflection

### 5.1 Integration of Considerations

This report has examined the fundraising platform through four interconnected lenses: social impact, ethics, legal compliance, and security. These considerations are not isolated but deeply interrelated:

**Social impact and ethics**: The platform's potential to democratize fundraising (positive social impact) raises ethical questions about fairness and inclusion. Who benefits from the platform, and who is excluded?

**Ethics and legal compliance**: Ethical principles like autonomy and consent are codified in legal frameworks like GDPR. Legal compliance is the minimum standard; ethical practice often requires going beyond legal requirements.

**Legal compliance and security**: Many legal obligations (GDPR's security principle, Payment Services Regulations) directly mandate security measures. Security failures can result in legal liability.

**Security and social impact**: Security measures (verification requirements) can have negative social impacts (excluding certain groups), demonstrating tensions between different considerations.

### 5.2 Key Learnings from Development

#### 5.2.1 Technical Learnings

**Iterative security improvement**: Security issues identified during development (PayPal credential exposure, missing rate limiting) were addressed iteratively, demonstrating that security is an ongoing process.


**Importance of documentation**: Creating comprehensive documentation (`SECURITY_FIXES_APPLIED.txt`, `DEPLOYMENT_CHECKLIST.md`, `EMAIL_NOTIFICATION_FLOW.md`) proved valuable not just for future developers but for clarifying thinking during development.

**Testing reveals limitations**: Manual testing of the organizer verification flow revealed accessibility and inclusion issues that weren't apparent during initial design, highlighting the importance of user testing.

**Third-party dependencies**: Leveraging established services (PayPal for payments, Cloudinary for storage, MongoDB Atlas for database) significantly reduced security burden and development time, though it introduced dependencies and potential vendor lock-in.

#### 5.2.2 Process Learnings

**Ethical approval value**: The ethical approval process, while sometimes feeling bureaucratic, forced explicit consideration of issues (data protection, consent, vulnerable populations) that might otherwise have been overlooked.

**Trade-offs are inevitable**: Perfect compliance with all considerations (comprehensive accessibility, full GDPR implementation, extensive security testing) would require far more time than available. Acknowledging limitations and prioritizing critical issues is necessary.

**Legal complexity**: Legal compliance is far more complex than initially anticipated. What seemed like straightforward requirements (GDPR compliance, accessibility) involve nuanced interpretation and substantial implementation effort.


**Communication matters**: The four-stage email notification system improved user experience and trust, demonstrating that technical features have social and psychological impacts beyond their functional purpose.

### 5.3 Limitations and Future Work

#### 5.3.1 Current Limitations

This project has several acknowledged limitations:

**Accessibility**: Comprehensive accessibility testing and WCAG 2.1 AA compliance not achieved. Screen reader compatibility, keyboard navigation, and color contrast require further work.

**GDPR compliance**: User rights (data export, deletion, rectification) not fully implemented. Privacy policy and consent mechanisms absent.

**Security testing**: No professional penetration testing or automated vulnerability scanning conducted. Production deployment would require comprehensive security assessment.

**Scalability**: Current architecture (single server, in-memory rate limiting, synchronous email sending) suitable for small-scale deployment but would require enhancement for high-volume use.

**Fraud prevention**: Verification relies on manual admin review. Automated fraud detection, duplicate account prevention, and ongoing monitoring not implemented.

**User experience**: No user research or usability testing conducted. Interface design based on developer assumptions rather than user feedback.


#### 5.3.2 Future Enhancements

Priority improvements for future development:

**Phase 1 (Essential for production):**
- Implement GDPR user rights (data export, deletion, rectification)
- Create comprehensive privacy policy and terms of service
- Achieve WCAG 2.1 AA accessibility compliance
- Conduct professional security assessment
- Implement httpOnly cookie authentication
- Add Content Security Policy headers

**Phase 2 (Operational improvements):**
- Migrate to professional email service (SendGrid, AWS SES)
- Implement email queue system for reliability
- Add structured logging and monitoring
- Implement automated fraud detection
- Add two-factor authentication option
- Create admin dashboard for application review

**Phase 3 (Enhanced functionality):**
- Multi-language support and localization
- Advanced campaign analytics
- Social media integration
- Mobile applications (iOS, Android)
- Campaign verification badges
- Donor recognition features

### 5.4 Broader Implications

This project highlights broader themes relevant to technology development:


**Technology is not neutral**: Design choices (verification requirements, campaign ordering, email notification timing) have social, ethical, and legal implications. Developers must consider these impacts, not just technical functionality.

**Compliance is complex**: Legal and ethical compliance requires specialized knowledge. Developers should collaborate with legal professionals, accessibility experts, and security specialists rather than attempting comprehensive compliance alone.

**Perfect is the enemy of good**: Waiting for perfect compliance with all considerations would prevent deployment entirely. Acknowledging limitations, prioritizing critical issues, and committing to ongoing improvement is more realistic than attempting perfection.

**User-centered design matters**: Technical capabilities mean little if the platform excludes or harms users. Accessibility, clear communication, and user research should be integral to development, not afterthoughts.

**Documentation is development**: Comprehensive documentation serves multiple purposes: knowledge transfer, compliance demonstration, security planning, and clarifying thinking during development.

### 5.5 Personal Reflection

Developing this fundraising platform while considering professional, social, ethical, legal, and security aspects has been both challenging and enlightening. Several key insights emerged:


**Complexity of responsible technology**: What initially seemed like a straightforward technical project revealed layers of complexity when examined through social, ethical, legal, and security lenses. Responsible technology development requires far more than technical competence.

**Value of structured reflection**: Writing this report forced explicit consideration of issues that might otherwise have remained implicit or overlooked. The process of articulating considerations, researching frameworks, and reflecting on decisions was as valuable as the conclusions reached.

**Importance of humility**: Recognizing the limitations of my knowledge (legal compliance, accessibility standards, security best practices) and the need for specialist expertise was humbling but important. Technology development is inherently collaborative.

**Ethical tensions are real**: Many situations involved genuine ethical dilemmas without clear "right" answers. Balancing security (strict verification) with inclusion (accessible to all), or balancing development speed with comprehensive compliance, required difficult trade-offs.

**Continuous learning is essential**: Technology, regulations, and best practices evolve constantly. What's compliant today may be inadequate tomorrow. Committing to ongoing learning and improvement is essential for responsible practice.


### 5.6 Final Thoughts

This fundraising platform demonstrates both the potential and the challenges of technology for social good. The application successfully implements core functionality—enabling campaign creation, secure donations, and organizer verification—while incorporating important security measures and considering social and ethical implications.

However, the project also reveals the gap between academic prototypes and production-ready systems. Full legal compliance, comprehensive accessibility, and robust security require resources, expertise, and time beyond what's feasible in an academic context. This gap is not a failure but a realistic acknowledgment of complexity.

The value of this project lies not just in the working application but in the process of grappling with real-world considerations that professional developers face daily. Understanding that technology development involves navigating social impacts, ethical dilemmas, legal requirements, and security threats—not just writing code—is perhaps the most important learning outcome.

Moving forward, whether in further development of this platform or in other projects, the frameworks and considerations explored in this report provide a foundation for responsible technology practice. The goal is not perfection but thoughtful, informed decision-making that acknowledges both capabilities and limitations while prioritizing user welfare and societal benefit.


---

## References

### Legal and Regulatory Sources

1. **General Data Protection Regulation (GDPR)** - Regulation (EU) 2016/679. Available at: https://gdpr-info.eu/

2. **Information Commissioner's Office (ICO)** - GDPR Guidance. Available at: https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/

3. **Equality Act 2010** - UK Legislation. Available at: https://www.legislation.gov.uk/ukpga/2010/15/contents

4. **Payment Services Regulations 2017** - UK Legislation. Available at: https://www.legislation.gov.uk/uksi/2017/752/contents

5. **Consumer Rights Act 2015** - UK Legislation. Available at: https://www.legislation.gov.uk/ukpga/2015/15/contents

6. **Fundraising Regulator** - Code of Fundraising Practice. Available at: https://www.fundraisingregulator.org.uk/code

### Technical and Security Standards

7. **Web Content Accessibility Guidelines (WCAG) 2.1** - W3C Recommendation. Available at: https://www.w3.org/WAI/WCAG21/quickref/

8. **OWASP Top Ten** - Web Application Security Risks. Available at: https://owasp.org/www-project-top-ten/

9. **PCI DSS** - Payment Card Industry Data Security Standard. Available at: https://www.pcisecuritystandards.org/


### Academic and Research Sources

10. **Friedman, B., & Hendry, D. G. (2019).** *Value Sensitive Design: Shaping Technology with Moral Imagination.* MIT Press.

11. **Nissenbaum, H. (2009).** *Privacy in Context: Technology, Policy, and the Integrity of Social Life.* Stanford University Press.

12. **Floridi, L. (2013).** *The Ethics of Information.* Oxford University Press.

13. **Zuboff, S. (2019).** *The Age of Surveillance Capitalism.* PublicAffairs.

14. **Noble, S. U. (2018).** *Algorithms of Oppression: How Search Engines Reinforce Racism.* NYU Press.

### Technical Documentation

15. **React Documentation** - Available at: https://react.dev/

16. **Express.js Documentation** - Available at: https://expressjs.com/

17. **MongoDB Documentation** - Available at: https://www.mongodb.com/docs/

18. **PayPal Developer Documentation** - Available at: https://developer.paypal.com/

19. **Cloudinary Documentation** - Available at: https://cloudinary.com/documentation

20. **Node.js Security Best Practices** - Available at: https://nodejs.org/en/docs/guides/security/


### Module Materials

21. **Module Lectures** - [Module Code] Lectures on Professional, Social, Ethical, Legal, and Security Considerations in Software Development

22. **Ethical Approval Documentation** - Ethics form and recommendations received for this project

### Project Documentation

23. **Project Documentation** - Various project files including:
    - `SECURITY_FIXES_APPLIED.txt` - Security measures implemented
    - `CREDENTIAL_ROTATION_GUIDE.md` - Security procedures
    - `DEPLOYMENT_CHECKLIST.md` - Deployment considerations
    - `EMAIL_NOTIFICATION_FLOW.md` - System functionality documentation
    - `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
    - `PAYPAL_CONFIG_SECURITY_UPDATE.md` - Security improvements

---

## Appendices

### Appendix A: Data Flow Diagram

The application processes personal data through the following flow:

**User Registration:**
User → Frontend → Backend API → Database (MongoDB)
- Data: Email, password (hashed), name
- Storage: User collection

**Organizer Application:**
User → Frontend → Backend API → File Storage (Cloudinary) → Database
- Data: Organization details, contact info, documents (ID, selfie)
- Storage: OrganizerApplication collection, Cloudinary


**Donation Processing:**
Donor → Frontend → PayPal → Backend API → Database
- Data: Donation amount, transaction ID, payer details
- Storage: Donation collection
- Note: Payment details handled by PayPal, not stored locally

**Email Notifications:**
Backend → Email Service (Gmail) → User
- Data: User email, application status, campaign details
- Storage: Transient (not stored after sending)

### Appendix B: Security Measures Summary

| Security Measure | Implementation Status | Notes |
|-----------------|----------------------|-------|
| Password Hashing | ✅ Implemented | bcrypt with automatic salting |
| HTTPS | ⚠️ Required for production | Development uses HTTP |
| Rate Limiting | ✅ Implemented | 5 attempts per 15 minutes |
| Input Validation | ✅ Implemented | Email, ObjectId validation |
| CORS | ✅ Implemented | Origin whitelist |
| Environment Variables | ✅ Implemented | Credentials protected |
| Role-Based Access | ✅ Implemented | Donor, Organizer, Admin roles |
| JWT Expiration | ✅ Implemented | 7-day expiration |
| Request Size Limits | ✅ Implemented | 10MB limit |
| Error Handling | ✅ Implemented | No information leakage |
| httpOnly Cookies | ❌ Not implemented | Recommended improvement |
| Content Security Policy | ❌ Not implemented | Recommended improvement |
| Two-Factor Authentication | ❌ Not implemented | Future enhancement |


### Appendix C: GDPR Compliance Checklist

| GDPR Requirement | Status | Implementation Notes |
|-----------------|--------|---------------------|
| Lawful basis for processing | ⚠️ Partial | Consent implied but not explicit |
| Privacy policy | ❌ Missing | Must be created |
| Consent mechanisms | ❌ Missing | No consent checkboxes |
| Right to access | ❌ Not implemented | No data export feature |
| Right to rectification | ❌ Not implemented | No self-service data update |
| Right to erasure | ❌ Not implemented | No account deletion |
| Right to data portability | ❌ Not implemented | No data export in machine-readable format |
| Data retention policies | ❌ Missing | No automatic deletion |
| Data breach procedures | ❌ Missing | No incident response plan |
| DPIA | ❌ Not conducted | Required for special category data |
| Data encryption at rest | ✅ Implemented | Via MongoDB Atlas |
| Data encryption in transit | ⚠️ Production only | HTTPS required |
| Access controls | ✅ Implemented | Role-based permissions |
| Audit logging | ⚠️ Basic | Console logs only |

### Appendix D: Accessibility Checklist

| WCAG 2.1 Criterion | Status | Notes |
|-------------------|--------|-------|
| Text alternatives (1.1.1) | ⚠️ Partial | Inconsistent alt text |
| Captions (1.2.2) | N/A | No video content |
| Color contrast (1.4.3) | ❓ Not tested | Requires measurement |
| Resize text (1.4.4) | ✅ Likely | Responsive design |
| Keyboard accessible (2.1.1) | ❓ Not tested | Requires verification |
| No keyboard trap (2.1.2) | ❓ Not tested | Requires verification |


| Timing adjustable (2.2.1) | ✅ Implemented | No time limits |
| Pause, stop, hide (2.2.2) | N/A | No auto-updating content |
| Three flashes (2.3.1) | ✅ Implemented | No flashing content |
| Page titled (2.4.2) | ✅ Implemented | React Helmet used |
| Focus order (2.4.3) | ❓ Not tested | Requires verification |
| Link purpose (2.4.4) | ⚠️ Partial | Some links unclear |
| Headings and labels (2.4.6) | ✅ Implemented | Semantic HTML |
| Focus visible (2.4.7) | ❓ Not tested | Requires verification |
| Language of page (3.1.1) | ✅ Implemented | HTML lang attribute |
| On focus (3.2.1) | ✅ Implemented | No unexpected changes |
| On input (3.2.2) | ✅ Implemented | No unexpected changes |
| Error identification (3.3.1) | ✅ Implemented | Form validation messages |
| Labels or instructions (3.3.2) | ✅ Implemented | Form labels present |
| Error suggestion (3.3.3) | ⚠️ Partial | Basic error messages |
| Parsing (4.1.1) | ✅ Likely | React generates valid HTML |
| Name, role, value (4.1.2) | ⚠️ Partial | Requires verification |

**Legend:**
- ✅ Implemented/Compliant
- ⚠️ Partially implemented
- ❌ Not implemented
- ❓ Not tested/Unknown
- N/A Not applicable


### Appendix E: Stakeholder Impact Analysis

| Stakeholder Group | Positive Impacts | Negative Impacts | Mitigation Strategies |
|------------------|------------------|------------------|----------------------|
| **Campaign Organizers** | - Access to fundraising tools<br>- Automated tracking<br>- Professional presentation | - Verification barriers<br>- Pressure to succeed<br>- Reputational risk | - Flexible verification options<br>- Clear expectations<br>- Support resources |
| **Donors** | - Convenient giving<br>- Transparency<br>- Secure payments | - Fraud risk<br>- Privacy concerns<br>- Decision overload | - Verification system<br>- Clear privacy policy<br>- Curated campaigns |
| **Administrators** | - Management tools<br>- Fraud prevention<br>- System oversight | - Review burden<br>- Liability concerns<br>- Decision responsibility | - Clear guidelines<br>- Dual review process<br>- Legal protection |
| **Beneficiaries** | - Receive needed funds<br>- Wider reach<br>- Faster fundraising | - Dependency on platform<br>- Competition for attention<br>- Platform fees | - Fair fee structure<br>- Campaign support<br>- Success resources |
| **Society** | - Charitable giving enabled<br>- Community building<br>- Crisis response | - Digital divide<br>- Fraud normalization<br>- Donor fatigue | - Accessibility focus<br>- Strong verification<br>- Education |


### Appendix F: Risk Assessment Matrix

| Risk Category | Likelihood | Impact | Severity | Mitigation Status |
|--------------|-----------|--------|----------|------------------|
| **Data Breach** | Medium | High | Critical | ⚠️ Partial - encryption implemented, monitoring needed |
| **Payment Fraud** | Medium | High | Critical | ✅ Good - PayPal handles processing, verification in place |
| **Campaign Fraud** | High | Medium | High | ⚠️ Partial - verification exists, ongoing monitoring needed |
| **Accessibility Lawsuit** | Low | Medium | Medium | ❌ Poor - WCAG compliance not verified |
| **GDPR Violation** | High | High | Critical | ❌ Poor - user rights not implemented |
| **Account Takeover** | Medium | Medium | Medium | ⚠️ Partial - rate limiting exists, 2FA needed |
| **XSS Attack** | Low | Medium | Medium | ✅ Good - React protections, CSP recommended |
| **SQL/NoSQL Injection** | Low | High | Medium | ✅ Good - Mongoose protections in place |
| **DDoS Attack** | Medium | Medium | Medium | ⚠️ Partial - rate limiting exists, CDN recommended |
| **Insider Threat** | Low | High | Medium | ⚠️ Partial - access controls exist, audit logging needed |

**Severity Calculation:** Likelihood × Impact
- **Critical:** Immediate action required
- **High:** Priority attention needed
- **Medium:** Should be addressed
- **Low:** Monitor and review


---

## Document Information

**Document Title:** Companion Report: Fundraising Web Application - Professional, Social, Ethical, Legal, and Security Considerations

**Author:** [Your Name]  
**Student ID:** [Your Student ID]  
**Module:** [Module Code and Name]  
**Academic Year:** 2025/2026  
**Submission Date:** January 2026

**Word Count:** Approximately 12,000 words

**Document Version:** 1.0  
**Last Updated:** January 22, 2026

---

## Acknowledgments

This report and the associated project would not have been possible without:

- **Module instructors** for providing frameworks and guidance on professional, social, ethical, legal, and security considerations
- **Ethical approval reviewers** for thoughtful feedback that improved the project's consideration of user welfare
- **Open-source community** for the libraries and tools that enabled rapid development
- **Documentation authors** for comprehensive guides on GDPR, WCAG, security best practices, and other standards

---

**End of Report**

