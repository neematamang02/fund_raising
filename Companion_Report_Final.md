# Companion Report: Fundraising Web Application
## Professional, Social, Ethical, Legal, and Security Considerations

**Student Name:** [Your Name]  
**Student ID:** [Your Student ID]  
**Module:** [Module Code and Name]  
**Date:** January 2026

---

## 1. Social Impact

### Introduction

Social impact examines how technology affects individuals, communities, and society, encompassing both intended benefits and unintended consequences (Friedman & Hendry, 2019). For a fundraising platform facilitating charitable giving and campaign management, understanding these impacts is essential for responsible development.

### Relevant Aspects and Project Application

**Democratization of Fundraising**

The platform significantly lowers barriers to fundraising by providing accessible tools for campaign creation and donation processing. Traditional fundraising often requires institutional backing or substantial resources; this application enables individuals and small organizations to reach wider audiences. The organizer application system was designed to balance accessibility (straightforward application process) with security (document verification requirements), allowing legitimate campaigners while protecting donors from fraud.

During development, the four-stage email notification system (application submitted, approved, rejected, revoked) emerged from recognizing users' need for transparent communication. Testing revealed this reduced anxiety about application status and built trust—demonstrating how technical features have social-psychological impacts beyond their functional purpose.

**Digital Divide and Exclusion**

The platform's digital nature inherently excludes certain populations: elderly individuals with limited digital literacy, communities with poor internet access, and people without PayPal accounts (Zuboff, 2019). The verification requirements (government ID, selfie upload) create additional barriers for refugees, homeless individuals, or those uncomfortable with photographic identification.

Development testing highlighted these tensions. While responsive design (React and Tailwind CSS) ensures mobile compatibility, comprehensive accessibility testing for screen readers and keyboard navigation was not conducted—potentially excluding users with disabilities. This represents approximately 15% of the global population (WHO, 2021), a significant ethical concern addressed in Section 2.

**Fraud Risk and Trust**

The platform could be exploited for fraudulent fundraising, creating social harm through financial loss and eroded trust in charitable giving. The multi-stage verification process (government ID, selfie, optional organizational documents) mitigates this risk but relies on manual admin review rather than automated systems. This approach balances security with resource constraints but may not scale effectively.

### Reflection

Social impact considerations directly influenced design decisions. Implementing pagination (20 campaigns per page) was partly driven by research showing excessive choice leads to decision paralysis (Schwartz, 2004), demonstrating that technical choices have psychological consequences. The tension between security (strict verification) and inclusion (accessibility for all) remained unresolved, highlighting that responsible technology development involves navigating competing social goods rather than achieving perfect solutions.

---

## 2. Ethical Considerations

### Introduction

Ethics in technology concerns moral principles guiding what should be built and how it should function (Floridi, 2013). For platforms handling personal data and financial transactions, ethical considerations span fairness, autonomy, beneficence (promoting welfare), and non-maleficence (avoiding harm).

### Relevant Aspects and Project Application

**Fairness and Algorithmic Bias**

The application displays campaigns chronologically (newest first), which appears neutral but creates recency bias—newer campaigns gain more visibility than older ones. This simple approach was chosen deliberately to avoid introducing algorithmic bias, yet raises ethical questions: is complete neutrality ethical, or should platforms actively promote urgent humanitarian needs? Noble (2018) demonstrates how seemingly neutral algorithms can perpetuate inequalities, suggesting this warrants deeper consideration.

The verification process requiring government ID and selfies creates potential discrimination against refugees, homeless individuals, and certain religious groups with concerns about photographic identification. While serving the legitimate aim of fraud prevention, the Equality Act 2010 requires considering less discriminatory alternatives. The current system's rigidity represents an ethical tension between security and inclusion that remains inadequately resolved.

**User Autonomy and Informed Consent**

The application collects substantial personal data: email addresses, names, government IDs, selfies, and payment information. Ethical data collection requires informed consent—users must understand what data is collected, why, and how it will be used (Nissenbaum, 2009). The current implementation lacks explicit consent mechanisms; users implicitly consent by using the platform, but no privacy policy or granular consent options exist.

GDPR Article 9 classifies government IDs and biometric data (selfies) as "special category data" requiring heightened protection and explicit consent. The absence of clear consent mechanisms represents a significant ethical gap, acknowledged during the ethical approval process but not yet addressed due to time constraints.

**Beneficence and Non-Maleficence**

The principle of beneficence requires actively promoting user welfare. The application attempts this through transparent donation tracking, secure PayPal integration, and comprehensive email notifications. Testing confirmed these features build trust and improve user experience.

Non-maleficence requires avoiding harm. The application implements several harm-reduction measures: error handling prevents crashes, rejection emails include constructive feedback, and rate limiting (5 login attempts per 15 minutes) prevents brute force attacks. However, the rejection email system, while necessary, could cause emotional distress. Language was carefully crafted to be constructive rather than punitive, but the inherent power imbalance (admin rejecting user application) remains ethically problematic.

**Accessibility as Ethical Imperative**

Accessibility is both a legal requirement (Equality Act 2010) and an ethical obligation to ensure technology serves all people, including those with disabilities. The application uses responsive design and semantic HTML but lacks comprehensive accessibility testing. Screen reader compatibility, keyboard navigation, and color contrast ratios were not verified against WCAG 2.1 AA standards. This represents an ethical failing—potentially excluding 15% of the population contradicts principles of fairness and inclusion.

### Reflection

Ethical considerations often conflicted with practical constraints. Implementing comprehensive accessibility features would require significant additional development time, yet excluding disabled users is ethically unacceptable. These tensions highlight that ethical technology development involves making informed trade-offs while acknowledging limitations, not achieving perfection. The ethical approval process was valuable in forcing explicit consideration of these issues, though many ethical questions remain unresolved and require ongoing attention.

---

## 3. Legal Implications

### Introduction

Legal compliance is essential for platforms handling personal data and financial transactions. This section examines relevant UK and EU legislation, including the General Data Protection Regulation (GDPR), Equality Act 2010, and financial regulations, explaining their specific application to this project.

### Relevant Aspects and Project Application

**General Data Protection Regulation (GDPR)**

GDPR applies to any organization processing personal data of EU individuals (ICO, 2021). The application processes multiple data categories: basic identity data (names, emails), contact information (phone numbers), financial data (donation amounts, transaction IDs), and special category data (government IDs, biometric selfies). Special category data requires heightened protec