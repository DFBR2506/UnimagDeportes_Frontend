# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/transversal.e2e.js >> Accesibilidad >> [TRX-23] contraste en /admin
- Location: e2e/demo/transversal.e2e.js:119:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 974

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#174648",
+               "contrastRatio": 4.21,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#65b82e",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.21 (foreground color: #65b82e, background color: #174648, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"hidden rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sidebar-primary uppercase sm:inline\">Admin</span>",
+                 "target": Array [
+                   ".bg-sidebar-primary\\/20",
+                 ],
+               },
+               Object {
+                 "html": "<header class=\"sticky top-0 z-40 bg-sidebar text-sidebar-foreground shadow-md shadow-sidebar/20 print:hidden\">",
+                 "target": Array [
+                   "header",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.21 (foreground color: #65b82e, background color: #174648, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"hidden rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sidebar-primary uppercase sm:inline\">Admin</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-sidebar-primary\\/20",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 8:00 a. m.–9:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 106px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">8:00 a. m.–9:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 3:00 p. m.–4:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 470px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">3:00 p. m.–4:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 4:00 p. m.–5:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 522px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">4:00 p. m.–5:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 7:00 a. m.–8:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 54px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">7:00 a. m.–8:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 12:00 p. m.–1:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 314px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">12:00 p. m.–1:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 1:00 p. m.–2:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">1:00 p. m.–2:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.border-border.relative:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 6:00 a. m.–7:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 2px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">6:00 a. m.–7:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 10:00 a. m.–11:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 210px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">10:00 a. m.–11:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 12:00 p. m.–1:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 314px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">12:00 p. m.–1:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 2:00 p. m.–3:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 418px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(18)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">2:00 p. m.–3:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(18) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 8:00 a. m.–9:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 106px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">8:00 a. m.–9:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 9:00 a. m.–10:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 158px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">9:00 a. m.–10:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 10:00 a. m.–11:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 210px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">10:00 a. m.–11:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 1:00 p. m.–2:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">1:00 p. m.–2:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 2:00 p. m.–3:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 418px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(18)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">2:00 p. m.–3:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(18) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 10:00 a. m.–11:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 210px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">10:00 a. m.–11:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 1:00 p. m.–2:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">1:00 p. m.–2:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 4:00 p. m.–5:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 522px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">4:00 p. m.–5:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 7:00 a. m.–8:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 54px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">7:00 a. m.–8:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 11:00 a. m.–12:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 262px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">11:00 a. m.–12:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 4:00 p. m.–5:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 522px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">4:00 p. m.–5:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 5:00 p. m.–6:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 574px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">5:00 p. m.–6:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 7:00 a. m.–8:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 54px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">7:00 a. m.–8:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 8:00 a. m.–9:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 106px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">8:00 a. m.–9:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 1:00 p. m.–2:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">1:00 p. m.–2:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e9edf1",
+               "contrastRatio": 3.46,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6a8097",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div title=\"Reserva · 2:00 p. m.–3:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 418px; height: 48px;\">",
+                 "target": Array [
+                   ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">2:00 p. m.–3:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-md\\:hidden.border-l.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button "UNIMAG DEPORTES" [ref=e6] [cursor=pointer]:
          - generic [ref=e8]:
            - generic [ref=e9]: UNIMAG
            - generic [ref=e10]: DEPORTES
        - generic [ref=e11]: Admin
        - navigation "Principal" [ref=e13]:
          - button "Panel de ocupación" [ref=e14] [cursor=pointer]
          - button "Espacios" [ref=e19] [cursor=pointer]
          - button "Bloquear franjas" [ref=e24] [cursor=pointer]
          - button "Reglas de uso" [ref=e29] [cursor=pointer]
        - button "ED Equipo de Deportes" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: ED
          - generic [ref=e37]: Equipo de Deportes
    - main [ref=e40]:
      - generic [ref=e42]:
        - generic [ref=e44]:
          - heading "Panel de ocupación" [level=1] [ref=e45]
          - paragraph [ref=e46]: Revisa todas las reservas y bloqueos de cada cancha, semana a semana.
        - generic [ref=e47]:
          - generic [ref=e48]:
            - heading "Indicadores · 23 nov – 29 nov" [level=2] [ref=e49]:
              - text: Indicadores
              - generic [ref=e50]: · 23 nov – 29 nov
            - group "Período de los indicadores" [ref=e51]:
              - button "Semana" [pressed] [ref=e52]
              - button "Mes" [ref=e53]
          - generic [ref=e54]:
            - generic [ref=e55]:
              - paragraph [ref=e56]: Reservas
              - paragraph [ref=e57]: "24"
            - generic [ref=e58]:
              - paragraph [ref=e59]: Cancelaciones tardías
              - paragraph [ref=e60]: "3"
            - generic [ref=e61]:
              - paragraph [ref=e62]: Inasistencias
              - paragraph [ref=e63]: "2"
            - generic [ref=e64]:
              - paragraph [ref=e65]: Usuarios suspendidos
              - paragraph [ref=e66]: "1"
        - generic [ref=e67]:
          - generic [ref=e83]:
            - generic [ref=e84]: Cancha
            - combobox "Cancha" [ref=e86] [cursor=pointer]:
              - generic [ref=e87]: Cancha de tenis 1
          - generic [ref=e91]:
            - generic [ref=e92]: Semana
            - generic [ref=e93]:
              - button "Semana anterior" [ref=e94] [cursor=pointer]
              - combobox "Semana" [ref=e98] [cursor=pointer]:
                - generic [ref=e99]: Esta semana · 23 nov – 29 nov 2026
              - button "Semana siguiente" [ref=e103] [cursor=pointer]
        - generic [ref=e105]:
          - generic [ref=e106]:
            - paragraph [ref=e107]: Horas reservadas
            - paragraph [ref=e108]:
              - text: "27"
              - generic [ref=e109]: h
          - generic [ref=e110]:
            - paragraph [ref=e111]: Horas bloqueadas
            - paragraph [ref=e112]:
              - text: "8"
              - generic [ref=e113]: h
          - generic [ref=e114]:
            - paragraph [ref=e115]: Horas libres
            - paragraph [ref=e116]:
              - text: "49"
              - generic [ref=e117]: h
          - generic [ref=e118]:
            - paragraph [ref=e119]: Ocupación
            - paragraph [ref=e120]:
              - text: "42"
              - generic [ref=e121]: "%"
        - generic [ref=e122]:
          - generic [ref=e124]:
            - heading "Cancha de tenis 1" [level=2] [ref=e125]
            - paragraph [ref=e126]:
              - generic [ref=e127]: 6:00 a. m. – 6:00 p. m.
              - generic [ref=e131]: Aforo 4
          - generic [ref=e139]:
            - generic [ref=e140]:
              - generic [ref=e141]: GMT-5
              - generic [ref=e142]:
                - generic [ref=e143]: lun
                - generic [ref=e144]: "23"
              - generic [ref=e145]:
                - generic [ref=e146]: mar
                - generic [ref=e147]: "24"
              - generic [ref=e148]:
                - generic [ref=e149]: mié
                - generic [ref=e150]: "25"
              - generic [ref=e151]:
                - generic [ref=e152]: jue
                - generic [ref=e153]: "26"
              - generic [ref=e154]:
                - generic [ref=e155]: vie
                - generic [ref=e156]: "27"
              - generic [ref=e157]:
                - generic [ref=e158]: sáb
                - generic [ref=e159]: "28"
              - generic [ref=e160]:
                - generic [ref=e161]: dom
                - generic [ref=e162]: "29"
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e165]: 7 a. m.
                - generic [ref=e166]: 8 a. m.
                - generic [ref=e167]: 9 a. m.
                - generic [ref=e168]: 10 a. m.
                - generic [ref=e169]: 11 a. m.
                - generic [ref=e170]: 12 p. m.
                - generic [ref=e171]: 1 p. m.
                - generic [ref=e172]: 2 p. m.
                - generic [ref=e173]: 3 p. m.
                - generic [ref=e174]: 4 p. m.
                - generic [ref=e175]: 5 p. m.
              - generic [ref=e176]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e177]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e178]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e179]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e180]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e181]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e182]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e183]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e184]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e185]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e186]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e187]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e188]
                - generic "Reserva · 8:00 a. m.–9:00 a. m." [ref=e189]:
                  - paragraph [ref=e190]: Reserva
                  - paragraph [ref=e191]: 8:00 a. m.–9:00 a. m.
                - generic "Reserva · 3:00 p. m.–4:00 p. m." [ref=e192]:
                  - paragraph [ref=e193]: Reserva
                  - paragraph [ref=e194]: 3:00 p. m.–4:00 p. m.
                - generic "Reserva · 4:00 p. m.–5:00 p. m." [ref=e195]:
                  - paragraph [ref=e196]: Reserva
                  - paragraph [ref=e197]: 4:00 p. m.–5:00 p. m.
              - generic [ref=e198]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e199]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e200]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e201]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e202]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e203]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e204]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e205]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e206]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e207]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e208]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e209]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e210]
                - generic "Reserva · 7:00 a. m.–8:00 a. m." [ref=e211]:
                  - paragraph [ref=e212]: Reserva
                  - paragraph [ref=e213]: 7:00 a. m.–8:00 a. m.
                - generic "Bloqueo institucional · 8:00 a. m.–9:00 a. m." [ref=e214]:
                  - paragraph [ref=e215]: Bloqueo institucional
                  - paragraph [ref=e216]: 8:00 a. m.–9:00 a. m.
                - generic "Reserva · 12:00 p. m.–1:00 p. m." [ref=e217]:
                  - paragraph [ref=e218]: Reserva
                  - paragraph [ref=e219]: 12:00 p. m.–1:00 p. m.
                - generic "Reserva · 1:00 p. m.–2:00 p. m." [ref=e220]:
                  - paragraph [ref=e221]: Reserva
                  - paragraph [ref=e222]: 1:00 p. m.–2:00 p. m.
                - generic "Reserva · 2:00 p. m.–3:00 p. m." [ref=e223]:
                  - paragraph [ref=e224]: Reserva
                  - paragraph [ref=e225]: 2:00 p. m.–3:00 p. m.
              - generic [ref=e226]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e227]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e228]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e229]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e230]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e231]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e232]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e233]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e234]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e235]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e236]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e237]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e238]
                - generic "Reserva · 6:00 a. m.–7:00 a. m." [ref=e239]:
                  - paragraph [ref=e240]: Reserva
                  - paragraph [ref=e241]: 6:00 a. m.–7:00 a. m.
                - generic "Bloqueo institucional · 7:00 a. m.–8:00 a. m." [ref=e242]:
                  - paragraph [ref=e243]: Bloqueo institucional
                  - paragraph [ref=e244]: 7:00 a. m.–8:00 a. m.
                - generic "Reserva · 10:00 a. m.–11:00 a. m." [ref=e245]:
                  - paragraph [ref=e246]: Reserva
                  - paragraph [ref=e247]: 10:00 a. m.–11:00 a. m.
                - generic "Reserva · 12:00 p. m.–1:00 p. m." [ref=e248]:
                  - paragraph [ref=e249]: Reserva
                  - paragraph [ref=e250]: 12:00 p. m.–1:00 p. m.
                - generic "Bloqueo institucional · 1:00 p. m.–2:00 p. m." [ref=e251]:
                  - paragraph [ref=e252]: Bloqueo institucional
                  - paragraph [ref=e253]: 1:00 p. m.–2:00 p. m.
                - generic "Reserva · 2:00 p. m.–3:00 p. m." [ref=e254]:
                  - paragraph [ref=e255]: Reserva
                  - paragraph [ref=e256]: 2:00 p. m.–3:00 p. m.
                - generic "Bloqueo institucional · 5:00 p. m.–6:00 p. m." [ref=e257]:
                  - paragraph [ref=e258]: Bloqueo institucional
                  - paragraph [ref=e259]: 5:00 p. m.–6:00 p. m.
              - generic [ref=e260]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e261]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e262]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e263]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e264]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e265]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e266]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e267]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e268]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e269]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e270]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e271]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e272]
                - generic "Reserva · 8:00 a. m.–9:00 a. m." [ref=e273]:
                  - paragraph [ref=e274]: Reserva
                  - paragraph [ref=e275]: 8:00 a. m.–9:00 a. m.
                - generic "Reserva · 9:00 a. m.–10:00 a. m." [ref=e276]:
                  - paragraph [ref=e277]: Reserva
                  - paragraph [ref=e278]: 9:00 a. m.–10:00 a. m.
                - generic "Reserva · 10:00 a. m.–11:00 a. m." [ref=e279]:
                  - paragraph [ref=e280]: Reserva
                  - paragraph [ref=e281]: 10:00 a. m.–11:00 a. m.
                - generic "Bloqueo institucional · 11:00 a. m.–12:00 p. m." [ref=e282]:
                  - paragraph [ref=e283]: Bloqueo institucional
                  - paragraph [ref=e284]: 11:00 a. m.–12:00 p. m.
                - generic "Reserva · 1:00 p. m.–2:00 p. m." [ref=e285]:
                  - paragraph [ref=e286]: Reserva
                  - paragraph [ref=e287]: 1:00 p. m.–2:00 p. m.
                - generic "Reserva · 2:00 p. m.–3:00 p. m." [ref=e288]:
                  - paragraph [ref=e289]: Reserva
                  - paragraph [ref=e290]: 2:00 p. m.–3:00 p. m.
              - generic [ref=e291]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e292]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e293]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e294]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e295]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e296]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e297]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e298]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e299]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e300]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e301]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e302]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e303]
                - generic "Bloqueo institucional · 7:00 a. m.–8:00 a. m." [ref=e304]:
                  - paragraph [ref=e305]: Bloqueo institucional
                  - paragraph [ref=e306]: 7:00 a. m.–8:00 a. m.
                - generic "Reserva · 10:00 a. m.–11:00 a. m." [ref=e307]:
                  - paragraph [ref=e308]: Reserva
                  - paragraph [ref=e309]: 10:00 a. m.–11:00 a. m.
                - generic "Reserva · 1:00 p. m.–2:00 p. m." [ref=e310]:
                  - paragraph [ref=e311]: Reserva
                  - paragraph [ref=e312]: 1:00 p. m.–2:00 p. m.
                - generic "Reserva · 4:00 p. m.–5:00 p. m." [ref=e313]:
                  - paragraph [ref=e314]: Reserva
                  - paragraph [ref=e315]: 4:00 p. m.–5:00 p. m.
              - generic [ref=e316]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e317]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e318]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e319]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e320]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e321]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e322]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e323]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e324]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e325]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e326]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e327]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e328]
                - generic "Reserva · 7:00 a. m.–8:00 a. m." [ref=e329]:
                  - paragraph [ref=e330]: Reserva
                  - paragraph [ref=e331]: 7:00 a. m.–8:00 a. m.
                - generic "Reserva · 11:00 a. m.–12:00 p. m." [ref=e332]:
                  - paragraph [ref=e333]: Reserva
                  - paragraph [ref=e334]: 11:00 a. m.–12:00 p. m.
                - generic "Reserva · 4:00 p. m.–5:00 p. m." [ref=e335]:
                  - paragraph [ref=e336]: Reserva
                  - paragraph [ref=e337]: 4:00 p. m.–5:00 p. m.
                - generic "Reserva · 5:00 p. m.–6:00 p. m." [ref=e338]:
                  - paragraph [ref=e339]: Reserva
                  - paragraph [ref=e340]: 5:00 p. m.–6:00 p. m.
              - generic [ref=e341]:
                - button "6:00 a. m.–7:00 a. m." [disabled] [ref=e342]
                - button "7:00 a. m.–8:00 a. m." [disabled] [ref=e343]
                - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e344]
                - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e345]
                - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e346]
                - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e347]
                - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e348]
                - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e349]
                - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e350]
                - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e351]
                - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e352]
                - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e353]
                - generic "Reserva · 7:00 a. m.–8:00 a. m." [ref=e354]:
                  - paragraph [ref=e355]: Reserva
                  - paragraph [ref=e356]: 7:00 a. m.–8:00 a. m.
                - generic "Reserva · 8:00 a. m.–9:00 a. m." [ref=e357]:
                  - paragraph [ref=e358]: Reserva
                  - paragraph [ref=e359]: 8:00 a. m.–9:00 a. m.
                - generic "Reserva · 1:00 p. m.–2:00 p. m." [ref=e360]:
                  - paragraph [ref=e361]: Reserva
                  - paragraph [ref=e362]: 1:00 p. m.–2:00 p. m.
                - generic "Reserva · 2:00 p. m.–3:00 p. m." [ref=e363]:
                  - paragraph [ref=e364]: Reserva
                  - paragraph [ref=e365]: 2:00 p. m.–3:00 p. m.
                - generic "Bloqueo institucional · 3:00 p. m.–5:00 p. m." [ref=e366]:
                  - paragraph [ref=e367]: Bloqueo institucional
                  - paragraph [ref=e368]: 3:00 p. m.–5:00 p. m.
          - list [ref=e369]:
            - listitem [ref=e370]: Reserva
            - listitem [ref=e372]: Bloqueo institucional
            - listitem [ref=e374]: Libre
  - generic:
    - region "Notifications"
```

# Test source

```ts
  25  |           expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${path} a ${width}`).toBeLessThanOrEqual(0)
  26  |           if (role !== 'null') await expect(page.getByRole('navigation', { name: 'Principal' }).locator('visible=true'), path).toHaveCount(1)
  27  |         }
  28  |       }
  29  |     })
  30  |   }
  31  | 
  32  |   test('[TRX-02] la barra inferior no tapa el final de la página', async ({ page, demo }) => {
  33  |     await page.setViewportSize({ width: 390, height: 800 })
  34  |     await demo({ state: conReserva() })
  35  |     for (const path of PANTALLAS.student) {
  36  |       await page.goto(path)
  37  |       await asentar(page)
  38  |       const solape = () => page.evaluate(() => {
  39  |         scrollTo(0, document.body.scrollHeight)
  40  |         const barra = [...document.querySelectorAll('nav[aria-label="Principal"]')].find((n) => getComputedStyle(n).position === 'fixed').getBoundingClientRect().top
  41  |         const items = [...document.querySelectorAll('main a, main button, main p')].filter((e) => e.offsetParent)
  42  |         const ultimo = items.reduce((a, e) => (e.getBoundingClientRect().bottom > a.getBoundingClientRect().bottom ? e : a))
  43  |         return { tapado: Math.max(0, Math.floor(ultimo.getBoundingClientRect().bottom - barra)), cual: ultimo.textContent.slice(0, 60) }
  44  |       })
  45  |       await expect.poll(solape, { message: path }).toMatchObject({ tapado: 0 })
  46  |     }
  47  |   })
  48  | 
  49  |   test('[TRX-04] al cambiar de sección en móvil abre arriba @movil', async ({ page, demo }) => {
  50  |     await page.setViewportSize({ width: 390, height: 700 })
  51  |     await demo()
  52  |     await page.goto('/app/mis-reservas/reglas')
  53  |     await asentar(page)
  54  |     await page.evaluate(() => scrollTo(0, 500))
  55  |     await page.getByRole('button', { name: 'Canchas' }).click()
  56  |     await expect(titulo(page, 'Disponibilidad')).toBeVisible()
  57  |     await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  58  |   })
  59  | 
  60  |   test('[DIS-38][DIS-39][DIS-40] calendario táctil @movil', async ({ page, demo, isMobile }) => {
  61  |     test.skip(!isMobile, 'solo con pantalla táctil')
  62  |     await demo()
  63  |     await abrirCancha(page)
  64  |     await expect(page.locator('[aria-busy] > div.border-l').locator('visible=true')).toHaveCount(1)
  65  |     await page.getByRole('button', { name: /Miércoles, 25/ }).tap()
  66  |     const cell = page.locator('[aria-busy] button:not([disabled])').locator('visible=true').first()
  67  |     await cell.scrollIntoViewIfNeeded()
  68  |     const box = await cell.boundingBox()
  69  |     const cdp = await page.context().newCDPSession(page)
  70  |     const y0 = await page.evaluate(() => scrollY)
  71  |     const dedo = (type, dy) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: dy == null ? [] : [{ x: Math.round(box.x + 40), y: Math.round(box.y + 20 + dy) }] })
  72  |     await dedo('touchStart', 0)
  73  |     for (let i = 1; i <= 10; i++) await dedo('touchMove', -20 * i)
  74  |     await dedo('touchEnd')
  75  |     await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(y0)
  76  |     await page.waitForTimeout(600)
  77  |     await expect(page.getByText('Franja seleccionada').locator('visible=true')).toHaveCount(0)
  78  |     await cell.tap()
  79  |     const seguir = page.getByRole('button', { name: /^Continuar/ }).locator('visible=true')
  80  |     await expect(seguir).toBeInViewport()
  81  |     await seguir.tap()
  82  |     await expect(titulo(page, 'Confirma tu reserva')).toBeVisible()
  83  |   })
  84  | 
  85  |   test('[TRX-08] cambiar de sección muy rápido no deja pantallas en blanco', async ({ page, demo, errores }) => {
  86  |     await demo()
  87  |     await page.goto('/app/inicio')
  88  |     for (let i = 0; i < 12; i++) await page.getByRole('navigation', { name: 'Principal' }).locator('visible=true').getByRole('button').nth(i % 3).click({ force: true })
  89  |     await expect(titulo(page, 'Mis reservas')).toBeVisible()
  90  |     expect(errores).toEqual([])
  91  |   })
  92  | 
  93  |   test('[QA-30] lo escrito durante la transición no se pierde', async ({ page }) => {
  94  |     test.fail(true, 'QA-30: la pantalla entrante se monta dos veces')
  95  |     await page.goto('/bienvenida')
  96  |     await asentar(page)
  97  |     await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  98  |     await page.waitForTimeout(150)
  99  |     await page.keyboard.type('maria', { delay: 20 })
  100 |     await page.waitForTimeout(1500)
  101 |     await expect(page.getByLabel('Correo institucional')).toHaveValue('maria', { timeout: 500 })
  102 |   })
  103 | })
  104 | 
  105 | test.describe('Accesibilidad', () => {
  106 |   // Contraste aparte (QA-11): así cualquier otra infracción sí hace fallar la prueba.
  107 |   for (const [role, paths] of Object.entries(PANTALLAS)) {
  108 |     for (const path of paths) {
  109 |       test(`[TRX-23] axe ${path.replace(ID.multiple1, ':cancha')}`, async ({ page, demo }) => {
  110 |         await demo({ role: role === 'null' ? null : role, state: conReserva() })
  111 |         await page.goto(path)
  112 |         await asentar(page)
  113 |         const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).disableRules(['color-contrast']).analyze()
  114 |         expect(violations.map((v) => `${v.id}: ${v.nodes[0].target}`)).toEqual([])
  115 |       })
  116 |     }
  117 |   }
  118 |   for (const path of [`/app/disponibilidad/${ID.multiple1}`, '/admin']) {
  119 |     test(`[TRX-23] contraste en ${path.replace(ID.multiple1, ':cancha')}`, async ({ page, demo }) => {
  120 |       test.fail(true, 'QA-11')
  121 |       await demo({ role: path.startsWith('/admin') ? 'admin' : 'student', time: null })
  122 |       await page.goto(path)
  123 |       await page.waitForTimeout(3500)
  124 |       const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()
> 125 |       expect(violations).toEqual([])
      |                          ^ Error: expect(received).toEqual(expected) // deep equality
  126 |     })
  127 |   }
  128 | 
  129 |   test('[TRX-21] diálogos: foco dentro y Esc devuelve el foco', async ({ page, demo }) => {
  130 |     await demo({ role: 'admin' })
  131 |     await page.goto('/admin/espacios')
  132 |     await asentar(page)
  133 |     const abrir = page.getByRole('button', { name: 'Crear espacio' })
  134 |     await abrir.click()
  135 |     const d = dialogo(page)
  136 |     await expect(d).toBeVisible()
  137 |     for (let i = 0; i < 40; i++) {
  138 |       await page.keyboard.press('Tab')
  139 |       expect(await d.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body || document.activeElement.hasAttribute('data-base-ui-focus-guard'))).toBe(true)
  140 |     }
  141 |     await page.keyboard.press('Escape')
  142 |     await expect(d).toBeHidden()
  143 |     await expect(abrir).toBeFocused()
  144 |   })
  145 | 
  146 |   test('[TRX-25] «reducir movimiento» detiene las animaciones decorativas', async ({ page }) => {
  147 |     test.fail(true, 'QA-31: solo el visor 360° lo respeta')
  148 |     await page.emulateMedia({ reducedMotion: 'reduce' })
  149 |     await page.goto('/bienvenida')
  150 |     await asentar(page)
  151 |     const pos = () => page.locator('.blur-3xl').first().evaluate((e) => getComputedStyle(e).transform)
  152 |     const a = await pos()
  153 |     await page.waitForTimeout(1000)
  154 |     expect(await pos()).toBe(a)
  155 |   })
  156 | 
  157 |   test('[TRX-20] los botones de cantidad se anuncian en español', async ({ page, demo }) => {
  158 |     test.fail(true, 'QA-34: dicen «Increment» y «Decrement»')
  159 |     await demo({ role: 'admin' })
  160 |     await page.goto('/admin/reglas')
  161 |     await expect(page.getByLabel(/Cuota semanal/)).toBeVisible()
  162 |     await expect(page.getByRole('button', { name: 'Increment' })).toHaveCount(0, { timeout: 1000 })
  163 |   })
  164 | })
  165 | 
  166 | test.describe('Contacto', () => {
  167 |   test('[TRX-30][TRX-31][TRX-32][TRX-34] abrir, validar y enviar @movil', async ({ page, demo, isMobile }) => {
  168 |     await demo()
  169 |     await page.goto('/app/inicio')
  170 |     await page.getByRole('button', { name: isMobile ? 'Contacto' : 'Contactar al administrador', exact: true }).click()
  171 |     const d = dialogo(page), enviar = d.getByRole('button', { name: 'Enviar mensaje' })
  172 |     await d.getByLabel('Mensaje').fill('   ')
  173 |     await expect(enviar).toBeDisabled()
  174 |     await d.getByLabel('Mensaje').fill('<script>alert(1)</script>')
  175 |     await enviar.click()
  176 |     await expect(page.getByText('Mensaje enviado')).toBeVisible()
  177 |     await expect(d).toBeHidden()
  178 |   })
  179 | 
  180 |   test('[TRX-33] el enlace del correo abre el formulario y recargar no lo reabre', async ({ page, demo }) => {
  181 |     await demo()
  182 |     await page.goto('/app/contacto')
  183 |     await expect(dialogo(page)).toBeVisible()
  184 |     await page.reload()
  185 |     await expect(titulo(page, /Hola/)).toBeVisible()
  186 |     await expect(dialogo(page)).toHaveCount(0)
  187 |   })
  188 | 
  189 |   test('[TRX-34] cerrar sin enviar conserva el borrador', async ({ page, demo }) => {
  190 |     test.fail(true, 'QA-12')
  191 |     await demo()
  192 |     await page.goto('/app/contacto')
  193 |     await page.getByLabel('Mensaje').fill('borrador')
  194 |     await page.keyboard.press('Escape')
  195 |     await expect(dialogo(page)).toBeHidden()
  196 |     await page.getByRole('button', { name: 'Contactar al administrador' }).click()
  197 |     await expect(page.getByLabel('Mensaje')).toHaveValue('borrador', { timeout: 1500 })
  198 |   })
  199 | })
  200 | 
  201 | test.describe('Robustez', () => {
  202 |   test('[TRX-44] los accesos de demostración no salen en producción', async ({ page }) => {
  203 |     test.fail(true, 'QA-14: este es el build de producción y aparecen')
  204 |     await page.goto('/bienvenida')
  205 |     await asentar(page)
  206 |     await expect(page.getByText('Entrar como administrador')).toHaveCount(0, { timeout: 1000 })
  207 |   })
  208 | 
  209 |   test('[TRX-51] con red lenta siempre hay indicador de carga', async ({ page, demo }) => {
  210 |     await demo({ role: null })
  211 |     await page.addInitScript(() => localStorage.setItem('ud-token', 'real'))
  212 |     await page.route('**/api/**', () => {}) // nunca responde
  213 |     await page.goto('/app/inicio')
  214 |     await expect(page.getByLabel('Cargando tu sesión')).toBeVisible()
  215 |   })
  216 | 
  217 |   test('[TRX-52] sin Local Storage la demo funciona en memoria', async ({ page }) => {
  218 |     await page.addInitScript(() => {
  219 |       for (const m of ['getItem', 'setItem', 'removeItem']) Storage.prototype[m] = () => { throw new Error('bloqueado') }
  220 |     })
  221 |     await page.goto('/bienvenida')
  222 |     await page.getByRole('button', { name: 'Entrar como estudiante' }).click()
  223 |     await expect(titulo(page, 'Hola, María')).toBeVisible()
  224 |   })
  225 | 
```