import pptxgen from "pptxgenjs";

console.log("Initializing PowerPoint Presentation Generation...");

const pptx = new pptxgen();

// Set presentation layout to 16:9 widescreen
pptx.layout = "LAYOUT_16x9";

// Define brand colors
const BRAND_PURPLE = "2D005D";      // Primary dark purple
const BRAND_LIGHT_PURPLE = "5B21B6"; // Secondary lighter purple
const BRAND_AMBER = "EA580C";       // Accent amber/orange
const BRAND_GOLD = "FBBF24";        // Secondary accent gold
const BRAND_DARK = "0F172A";        // Dark slate for text
const BRAND_LIGHT_BG = "F8FAFC";    // Light page background
const BRAND_MUTED = "64748B";       // Muted text gray
const WHITE = "FFFFFF";

// Helper function to apply common slide headers
function addSlideHeader(slide, titleText) {
    // Top border accent line
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.0,
        y: 0.0,
        w: 13.33,
        h: 0.15,
        fill: { color: BRAND_AMBER }
    });

    // Main Header Title
    slide.addText(titleText, {
        x: 0.8,
        y: 0.4,
        w: 11.7,
        h: 0.8,
        fontSize: 32,
        fontFace: "Arial",
        bold: true,
        color: BRAND_LIGHT_PURPLE,
        align: "left",
        valign: "middle"
    });

    // Thin accent divider below title
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.8,
        y: 1.2,
        w: 4.5,
        h: 0.03,
        fill: { color: BRAND_AMBER }
    });
}

// ----------------------------------------------------
// SLIDE 1: Title Slide (Dark Purple Background)
// ----------------------------------------------------
const slide1 = pptx.addSlide();
slide1.background = { color: BRAND_PURPLE };

// Left glowing accent bar
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.0,
    y: 0.0,
    w: 0.4,
    h: 7.5,
    fill: { color: BRAND_GOLD }
});

// Title
slide1.addText("Aqooni Digital", {
    x: 1.2,
    y: 2.0,
    w: 11.0,
    h: 1.2,
    fontSize: 54,
    fontFace: "Arial",
    bold: true,
    color: BRAND_GOLD,
    align: "left"
});

// Subtitle
slide1.addText("Empowering Education Through Secure Digital Records", {
    x: 1.2,
    y: 3.2,
    w: 11.0,
    h: 0.8,
    fontSize: 24,
    fontFace: "Arial",
    bold: false,
    color: WHITE,
    align: "left"
});

// Description / Footer
slide1.addText("Unified Multi-School Management & Credential Verification Platform", {
    x: 1.2,
    y: 5.5,
    w: 11.0,
    h: 0.6,
    fontSize: 14,
    fontFace: "Arial",
    italic: true,
    color: "C4B5FD",
    align: "left"
});


// ----------------------------------------------------
// SLIDE 2: The Modern School Challenge (Light BG)
// ----------------------------------------------------
const slide2 = pptx.addSlide();
slide2.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide2, "The Modern School Challenge");

// Left Column: Key Issues
slide2.addText(
    [
        { text: "• Manual Record-Keeping:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "High risk of data loss, physical damage, and transcription errors.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Certificate Fraud:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Increasingly difficult to verify academic credentials instantly and reliably.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Disconnected Systems:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Administrators struggle to manage multiple branches, classes, or exams seamlessly.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Lack of Transparency:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Parents, students, and employers lack real-time access to official data.", options: { color: BRAND_DARK } }
    ],
    {
        x: 0.8,
        y: 1.8,
        w: 5.8,
        h: 5.0,
        fontSize: 16,
        fontFace: "Arial",
        lineSpacing: 22
    }
);

// Right Column: Visually Outstanding Callout Box
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.2,
    y: 1.8,
    w: 5.2,
    h: 4.8,
    fill: { color: "FFEFE6" }, // Very soft warm amber tint
    line: { color: BRAND_AMBER, width: 2 }
});

slide2.addText("THE COST OF INEFFICIENCY", {
    x: 7.6,
    y: 2.2,
    w: 4.4,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    bold: true,
    color: BRAND_AMBER
});

slide2.addText(
    "Paper-based certification and offline database registers create a trust bottleneck. Educational institutions require a digital-first approach to protect academic integrity, decrease administrative overhead, and restore public verification trust.",
    {
        x: 7.6,
        y: 2.9,
        w: 4.4,
        h: 3.2,
        fontSize: 16,
        fontFace: "Arial",
        color: BRAND_DARK,
        lineSpacing: 26
    }
);


// ----------------------------------------------------
// SLIDE 3: Our Solution (Light BG)
// ----------------------------------------------------
const slide3 = pptx.addSlide();
slide3.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide3, "Our Solution: Aqooni Digital");

// We will build a 2x2 Grid of Rounded Cards
const cards = [
    {
        title: "1. Cloud-Based Resilience",
        desc: "24/7 secure access with automatic database backups, protecting critical academic history from physical losses.",
        x: 0.8, y: 1.8
    },
    {
        title: "2. Secure Authentication",
        desc: "Enterprise-grade user identity verification powered by Clerk, ensuring secure multi-role access controls.",
        x: 6.8, y: 1.8
    },
    {
        title: "3. Multi-Tenant Architecture",
        desc: "Every school runs on its own isolated space with custom branding, settings, configurations, and billing models.",
        x: 0.8, y: 4.5
    },
    {
        title: "4. Public Verification Portal",
        desc: "Allows employers and third parties to instantly verify certificate authenticity online using QR codes or unique Registry IDs.",
        x: 6.8, y: 4.5
    }
];

cards.forEach(card => {
    // Card background
    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: card.x,
        y: card.y,
        w: 5.6,
        h: 2.3,
        fill: { color: "FFFFFF" },
        line: { color: "E2E8F0", width: 1 }
    });

    // Left amber accent bar inside card
    slide3.addShape(pptx.shapes.RECTANGLE, {
        x: card.x,
        y: card.y + 0.2,
        w: 0.08,
        h: 1.9,
        fill: { color: BRAND_AMBER }
    });

    // Card Title
    slide3.addText(card.title, {
        x: card.x + 0.3,
        y: card.y + 0.2,
        w: 5.0,
        h: 0.4,
        fontSize: 18,
        fontFace: "Arial",
        bold: true,
        color: BRAND_LIGHT_PURPLE
    });

    // Card Description
    slide3.addText(card.desc, {
        x: card.x + 0.3,
        y: card.y + 0.7,
        w: 5.0,
        h: 1.4,
        fontSize: 14,
        fontFace: "Arial",
        color: BRAND_DARK,
        lineSpacing: 20
    });
});


// ----------------------------------------------------
// SLIDE 4: Key User Roles (Light BG)
// ----------------------------------------------------
const slide4 = pptx.addSlide();
slide4.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide4, "Role-Based Platform Access");

// 3 Columns representing the 3 primary roles
const roles = [
    {
        name: "SUPER ADMINISTRATOR",
        color: BRAND_PURPLE,
        points: [
            "Full platform-wide oversight",
            "Approve school onboarding status",
            "Manage platform branding & logo",
            "Handle global credit & subscription requests",
            "Real-time system-wide analytics logs"
        ],
        x: 0.8
    },
    {
        name: "SCHOOL ADMINISTRATOR",
        color: BRAND_LIGHT_PURPLE,
        points: [
            "Manage school settings & local branding",
            "Register students & assign class levels",
            "Track daily presence & sessions",
            "Configure subject assessment columns",
            "Generate & download official PDF certificates"
        ],
        x: 4.8
    },
    {
        name: "PUBLIC VERIFIER",
        color: BRAND_AMBER,
        points: [
            "Public verification search page",
            "Direct link navigation via certificate QR codes",
            "Verify student details & academic year",
            "Validate authentic grade records",
            "Download original certified PDF copies"
        ],
        x: 8.8
    }
];

roles.forEach(role => {
    // Header block for role
    slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: role.x,
        y: 1.8,
        w: 3.7,
        h: 4.8,
        fill: { color: "FFFFFF" },
        line: { color: "E2E8F0", width: 1 }
    });

    // Top border card accent color
    slide4.addShape(pptx.shapes.RECTANGLE, {
        x: role.x,
        y: 1.8,
        w: 3.7,
        h: 0.8,
        fill: { color: role.color }
    });

    // Role Name Text
    slide4.addText(role.name, {
        x: role.x + 0.1,
        y: 1.9,
        w: 3.5,
        h: 0.6,
        fontSize: 16,
        fontFace: "Arial",
        bold: true,
        color: WHITE,
        align: "center",
        valign: "middle"
    });

    // Bullet points text
    const bulletList = role.points.map(pt => `• ${pt}\n\n`);
    slide4.addText(bulletList.join(""), {
        x: role.x + 0.2,
        y: 2.8,
        w: 3.3,
        h: 3.6,
        fontSize: 13,
        fontFace: "Arial",
        color: BRAND_DARK,
        lineSpacing: 18
    });
});


// ----------------------------------------------------
// SLIDE 5: The Certificate Ecosystem (Light BG)
// ----------------------------------------------------
const slide5 = pptx.addSlide();
slide5.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide5, "The Certificate Ecosystem");

// Left column text
slide5.addText(
    [
        { text: "• Custom Institutional Branding:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Schools upload custom logos, signature images, and authorized digital stamps.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Professional Design Templates:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Choose from 12 distinct premium color palettes and layouts matching school identities.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• One-Click High-Quality Rendering:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Instant client-side high-resolution PDF rendering utilizing HTML2Canvas-pro and jsPDF.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Immutable Database Registry:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Every certificate has a unique ID tied back to the database, ensuring absolute verification.", options: { color: BRAND_DARK } }
    ],
    {
        x: 0.8,
        y: 1.8,
        w: 6.0,
        h: 5.0,
        fontSize: 15,
        fontFace: "Arial",
        lineSpacing: 22
    }
);

// Right Column: Visual Box - Layout Flow
slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.4,
    y: 1.8,
    w: 5.0,
    h: 4.8,
    fill: { color: "F1F5F9" },
    line: { color: "CBD5E1", width: 1 }
});

slide5.addText("CERTIFICATE VERIFICATION FLOW", {
    x: 7.7,
    y: 2.1,
    w: 4.4,
    h: 0.5,
    fontSize: 16,
    fontFace: "Arial",
    bold: true,
    color: BRAND_LIGHT_PURPLE,
    align: "center"
});

// Flow steps
const steps = [
    "Step 1: Admin configures subjects, grading limits, and school logo.",
    "Step 2: Admin inputs/imports student scores for multiple assessment tests.",
    "Step 3: Platform calculates totals, percentages, and pass/fail statuses.",
    "Step 4: System generates a PDF certificate embedded with a unique verification URL/QR code.",
    "Step 5: Verifier scans the QR code and instantly views authenticated records."
];

steps.forEach((step, idx) => {
    const stepY = 2.8 + (idx * 0.75);
    
    // Step indicator bubble
    slide5.addShape(pptx.shapes.OVAL, {
        x: 7.7,
        y: stepY,
        w: 0.4,
        h: 0.4,
        fill: { color: BRAND_AMBER }
    });

    slide5.addText((idx + 1).toString(), {
        x: 7.7,
        y: stepY,
        w: 0.4,
        h: 0.4,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: WHITE,
        align: "center",
        valign: "middle"
    });

    // Step text
    slide5.addText(step, {
        x: 8.3,
        y: stepY - 0.05,
        w: 3.8,
        h: 0.5,
        fontSize: 12,
        fontFace: "Arial",
        color: BRAND_DARK,
        lineSpacing: 14
    });
});


// ----------------------------------------------------
// SLIDE 6: Attendance & Monitoring (Light BG)
// ----------------------------------------------------
const slide6 = pptx.addSlide();
slide6.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide6, "Academics & Attendance Monitoring");

// Left Column
slide6.addText(
    [
        { text: "• Daily Attendance Logs:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Record presence, absence, late arrivals, and excused leaves for multiple school sessions.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Monthly Analytics & Rates:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Auto-computed attendance ratios and visual summaries for individual students and classes.\n\n", options: { color: BRAND_DARK } },
        
        { text: "• Multi-Exam Grading Matrix:\n", options: { bold: true, color: BRAND_LIGHT_PURPLE } },
        { text: "Configure custom test columns (e.g. Attendance, Quiz, Midterm, Final Exam) with individual max weight constraints.\n\n", options: { color: BRAND_DARK } }
    ],
    {
        x: 0.8,
        y: 1.8,
        w: 5.8,
        h: 5.0,
        fontSize: 16,
        fontFace: "Arial",
        lineSpacing: 22
    }
);

// Right Column: Callout on Multi-language support
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.2,
    y: 1.8,
    w: 5.3,
    h: 4.8,
    fill: { color: "FAF5FF" }, // Soft purple tint
    line: { color: BRAND_LIGHT_PURPLE, width: 2 }
});

slide6.addText("MULTI-LANGUAGE & RTL SUPPORT", {
    x: 7.5,
    y: 2.1,
    w: 4.7,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    bold: true,
    color: BRAND_LIGHT_PURPLE
});

slide6.addText(
    "Aqooni Digital is fully localized to support global and local educational ecosystems. The system provides real-time toggle controls for three core languages:\n\n" +
    "1. English - Standard academic terms.\n" +
    "2. Arabic (العربية) - Fully compatible Right-to-Left (RTL) rendering layouts.\n" +
    "3. Somali (Soomaali) - Tailored local educational phrasing.\n\n" +
    "Dynamic templates automatically shift orientation, alignment, and translation strings upon localization change.",
    {
        x: 7.5,
        y: 2.7,
        w: 4.7,
        h: 3.7,
        fontSize: 14,
        fontFace: "Arial",
        color: BRAND_DARK,
        lineSpacing: 20
    }
);


// ----------------------------------------------------
// SLIDE 7: Sustainable Growth & Credit System (Light BG)
// ----------------------------------------------------
const slide7 = pptx.addSlide();
slide7.background = { color: BRAND_LIGHT_BG };
addSlideHeader(slide7, "Sustainable Credit Growth System");

// Columns layout
// Column 1: On-Demand Scale
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.8, w: 3.6, h: 4.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
});
slide7.addText("Scale Capacity", {
    x: 1.0, y: 2.1, w: 3.2, h: 0.4,
    fontSize: 18, fontFace: "Arial", bold: true, color: BRAND_LIGHT_PURPLE
});
slide7.addText(
    "Schools purchase registration credits. Credits determine student enrollment limit. This credit-based usage allows small institutions to operate affordably and purchase capacity only as they grow.",
    {
        x: 1.0, y: 2.7, w: 3.2, h: 3.5,
        fontSize: 14, fontFace: "Arial", color: BRAND_DARK, lineSpacing: 22
    }
);

// Column 2: Transparent Plans
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 4.8, y: 1.8, w: 3.6, h: 4.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
});
slide7.addText("Flexible Subscriptions", {
    x: 5.0, y: 2.1, w: 3.2, h: 0.4,
    fontSize: 18, fontFace: "Arial", bold: true, color: BRAND_AMBER
});
slide7.addText(
    "Option to switch between Monthly and Yearly institutional billing cycles. Provides schools with clear expense planning, customizable invoice items, and system integrity safeguards.",
    {
        x: 5.0, y: 2.7, w: 3.2, h: 3.5,
        fontSize: 14, fontFace: "Arial", color: BRAND_DARK, lineSpacing: 22
    }
);

// Column 3: Platform Integrity
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.8, y: 1.8, w: 3.7, h: 4.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
});
slide7.addText("Financial Security", {
    x: 9.0, y: 2.1, w: 3.3, h: 0.4,
    fontSize: 18, fontFace: "Arial", bold: true, color: BRAND_LIGHT_PURPLE
});
slide7.addText(
    "Credit requests are requested directly through the School Admin panel. All approvals are reviewed and managed by platform Super Admins. Safeguards school credentials and prevents unauthorized data creation.",
    {
        x: 9.0, y: 2.7, w: 3.3, h: 3.5,
        fontSize: 14, fontFace: "Arial", color: BRAND_DARK, lineSpacing: 22
    }
);


// ----------------------------------------------------
// SLIDE 8: Future-Ready Education (Dark BG)
// ----------------------------------------------------
const slide8 = pptx.addSlide();
slide8.background = { color: BRAND_PURPLE };

// Left glowing accent bar
slide8.addShape(pptx.shapes.RECTANGLE, {
    x: 0.0,
    y: 0.0,
    w: 0.4,
    h: 7.5,
    fill: { color: BRAND_AMBER }
});

// Title
slide8.addText("Future-Ready Education", {
    x: 1.2,
    y: 1.5,
    w: 11.0,
    h: 0.8,
    fontSize: 40,
    fontFace: "Arial",
    bold: true,
    color: BRAND_GOLD
});

// Bullet list of key takeaways
slide8.addText(
    [
        { text: "✔  Global Accessibility: ", options: { bold: true, color: BRAND_GOLD } },
        { text: "Access administrative dashboards securely from anywhere.\n\n", options: { color: WHITE } },
        
        { text: "✔  Data-Driven Insights: ", options: { bold: true, color: BRAND_GOLD } },
        { text: "Instant analytics on student progress, passing rates, and presence logs.\n\n", options: { color: WHITE } },
        
        { text: "✔  Elevated Professionalism: ", options: { bold: true, color: BRAND_GOLD } },
        { text: "A digital-first institutional footprint that builds parental and public trust.\n\n", options: { color: WHITE } },
        
        { text: "✔  Absolute Platform Security: ", options: { bold: true, color: BRAND_GOLD } },
        { text: "Encrypted, robust database schema ensuring zero multi-tenancy cross-overs.", options: { color: WHITE } }
    ],
    {
        x: 1.2,
        y: 2.6,
        w: 10.5,
        h: 3.2,
        fontSize: 18,
        fontFace: "Arial",
        lineSpacing: 24
    }
);

// Footer Contact Callout
slide8.addText("Aqooni Digital  |  Contact: Support@aqoonidigital.edu  |  +252-0614163362", {
    x: 1.2,
    y: 6.2,
    w: 11.0,
    h: 0.5,
    fontSize: 14,
    fontFace: "Arial",
    italic: true,
    color: "C4B5FD",
    align: "left"
});

// ----------------------------------------------------
// Save the presentation
// ----------------------------------------------------
const outputFileName = "Aqooni_Digital_Presentation.pptx";
pptx.writeFile({ fileName: outputFileName })
    .then((filename) => {
        console.log(`\n======================================================`);
        console.log(`SUCCESS: Presentation file successfully created:`);
        console.log(`Path: ${filename}`);
        console.log(`======================================================\n`);
    })
    .catch((err) => {
        console.error("ERROR generating presentation:", err);
        process.exit(1);
    });
