# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/transversal.e2e.js >> Accesibilidad >> [TRX-23] contraste en /app/disponibilidad/:cancha
- Location: e2e/demo/transversal.e2e.js:119:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 723

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
+                 "html": "<div title=\"Reservada · 8:00 a. m.–10:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 2px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">8:00 a. m.–10:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 3:00 p. m.–4:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
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
+           ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 5:00 p. m.–6:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 470px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
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
+           ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 7:00 p. m.–8:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 574px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">7:00 p. m.–8:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.border-border.relative:nth-child(2) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 12:00 p. m.–2:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 210px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">12:00 p. m.–2:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 3:00 p. m.–4:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 366px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(3) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 8:00 a. m.–9:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 2px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 11:00 a. m.–1:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 158px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">11:00 a. m.–1:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 5:00 p. m.–6:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 470px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(4) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 9:00 a. m.–10:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 54px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 6:00 p. m.–8:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 522px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">6:00 p. m.–8:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(5) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(17) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 9:00 a. m.–10:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 54px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 4:00 p. m.–6:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 418px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">4:00 p. m.–6:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 7:00 p. m.–8:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 574px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">7:00 p. m.–8:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(6) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 8:00 a. m.–9:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 2px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 10:00 a. m.–12:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 106px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">10:00 a. m.–12:00 p. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(14) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 2:00 p. m.–3:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 314px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 5:00 p. m.–6:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 470px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(7) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(16) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 8:00 a. m.–10:00 a. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 2px; height: 100px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.46 (foreground color: #6a8097, background color: #e9edf1, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"truncate opacity-80\">8:00 a. m.–10:00 a. m.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".border-l.max-md\\:hidden.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(13) > .opacity-80.truncate",
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
+                 "html": "<div title=\"Reservada · 12:00 p. m.–1:00 p. m.\" class=\"absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs bg-smooth-200 border-smooth-600 text-muted-foreground\" style=\"top: 210px; height: 48px;\">",
+                 "target": Array [
+                   ".border-l.max-md\\:hidden.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15)",
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
+           ".border-l.max-md\\:hidden.border-border:nth-child(8) > .bg-smooth-200.border-smooth-600.inset-x-1:nth-child(15) > .opacity-80.truncate",
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
  - generic [ref=e2]:
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e5]:
          - button "UNIMAG DEPORTES" [ref=e6] [cursor=pointer]:
            - generic [ref=e8]:
              - generic [ref=e9]: UNIMAG
              - generic [ref=e10]: DEPORTES
          - navigation "Principal" [ref=e12]:
            - button "Inicio" [ref=e13] [cursor=pointer]
            - button "Disponibilidad" [ref=e17] [cursor=pointer]
            - button "Mis reservas" [ref=e21] [cursor=pointer]
          - button "MP María Pérez" [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: MP
            - generic [ref=e29]: María Pérez
      - main [ref=e32]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]:
              - button "Todas las canchas" [ref=e37] [cursor=pointer]
              - heading "Cancha múltiple 1" [level=1] [ref=e40]
              - paragraph [ref=e41]:
                - generic [ref=e42]: 8:00 a. m. – 8:00 p. m.
                - generic [ref=e46]: Aforo 20 personas
                - generic [ref=e52]: Calzado deportivo
            - generic [ref=e53]:
              - paragraph [ref=e54]: Disciplina
              - group "Disciplina" [ref=e55]:
                - button "Baloncesto" [pressed] [ref=e56]
                - button "Voleibol" [ref=e57]
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]:
                - button "Hoy" [disabled]
                - generic [ref=e61]:
                  - button "Semana anterior" [disabled]
                  - button "Semana siguiente" [ref=e62] [cursor=pointer]
                - heading "Noviembre de 2026" [level=2] [ref=e64]
                - paragraph [ref=e65]: En vivo · 2:29 p. m.
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: GMT-5
                  - generic [ref=e72]:
                    - generic [ref=e73]: mar
                    - generic [ref=e74]: "24"
                  - generic [ref=e75]:
                    - generic [ref=e76]: mié
                    - generic [ref=e77]: "25"
                  - generic [ref=e78]:
                    - generic [ref=e79]: jue
                    - generic [ref=e80]: "26"
                  - generic [ref=e81]:
                    - generic [ref=e82]: vie
                    - generic [ref=e83]: "27"
                  - generic [ref=e84]:
                    - generic [ref=e85]: sáb
                    - generic [ref=e86]: "28"
                  - generic [ref=e87]:
                    - generic [ref=e88]: dom
                    - generic [ref=e89]: "29"
                  - generic [ref=e90]:
                    - generic [ref=e91]: lun
                    - generic [ref=e92]: "30"
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - generic [ref=e95]: 9 a. m.
                    - generic [ref=e96]: 10 a. m.
                    - generic [ref=e97]: 11 a. m.
                    - generic [ref=e98]: 12 p. m.
                    - generic [ref=e99]: 1 p. m.
                    - generic [ref=e100]: 2 p. m.
                    - generic [ref=e101]: 3 p. m.
                    - generic [ref=e102]: 4 p. m.
                    - generic [ref=e103]: 5 p. m.
                    - generic [ref=e104]: 6 p. m.
                    - generic [ref=e105]: 7 p. m.
                  - generic [ref=e106]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e107]
                    - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e108]
                    - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e109]
                    - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e110]
                    - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e111]
                    - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e112]
                    - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e113]
                    - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e114]
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e115] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e116]
                    - button "6:00 p. m.–7:00 p. m. · libre" [ref=e117] [cursor=pointer]:
                      - generic: 6 p. m.
                    - button "7:00 p. m.–8:00 p. m." [disabled] [ref=e118]
                    - generic "Reservada · 8:00 a. m.–10:00 a. m." [ref=e119]:
                      - paragraph [ref=e120]: Reservada
                      - paragraph [ref=e121]: 8:00 a. m.–10:00 a. m.
                    - generic "Reservada · 3:00 p. m.–4:00 p. m." [ref=e122]:
                      - paragraph [ref=e123]: Reservada
                      - paragraph [ref=e124]: 3:00 p. m.–4:00 p. m.
                    - generic "Reservada · 5:00 p. m.–6:00 p. m." [ref=e125]:
                      - paragraph [ref=e126]: Reservada
                      - paragraph [ref=e127]: 5:00 p. m.–6:00 p. m.
                    - generic "Reservada · 7:00 p. m.–8:00 p. m." [ref=e128]:
                      - paragraph [ref=e129]: Reservada
                      - paragraph [ref=e130]: 7:00 p. m.–8:00 p. m.
                  - generic [ref=e131]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e132]
                    - button "9:00 a. m.–10:00 a. m. · libre" [ref=e133] [cursor=pointer]:
                      - generic: 9 a. m.
                    - button "10:00 a. m.–11:00 a. m. · libre" [ref=e134] [cursor=pointer]:
                      - generic: 10 a. m.
                    - button "11:00 a. m.–12:00 p. m. · libre" [ref=e135] [cursor=pointer]:
                      - generic: 11 a. m.
                    - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e136]
                    - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e137]
                    - button "2:00 p. m.–3:00 p. m. · libre" [ref=e138] [cursor=pointer]:
                      - generic: 2 p. m.
                    - button "3:00 p. m.–4:00 p. m." [disabled] [ref=e139]
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e140] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e141]
                    - button "6:00 p. m.–7:00 p. m. · libre" [ref=e142] [cursor=pointer]:
                      - generic: 6 p. m.
                    - button "7:00 p. m.–8:00 p. m. · libre" [ref=e143] [cursor=pointer]:
                      - generic: 7 p. m.
                    - generic "Clases · 8:00 a. m.–9:00 a. m." [ref=e144]:
                      - paragraph [ref=e145]: Clases
                      - paragraph [ref=e146]: 8:00 a. m.–9:00 a. m.
                    - generic "Reservada · 12:00 p. m.–2:00 p. m." [ref=e147]:
                      - paragraph [ref=e148]: Reservada
                      - paragraph [ref=e149]: 12:00 p. m.–2:00 p. m.
                    - generic "Reservada · 3:00 p. m.–4:00 p. m." [ref=e150]:
                      - paragraph [ref=e151]: Reservada
                      - paragraph [ref=e152]: 3:00 p. m.–4:00 p. m.
                    - generic "Clases · 5:00 p. m.–6:00 p. m." [ref=e153]:
                      - paragraph [ref=e154]: Clases
                      - paragraph [ref=e155]: 5:00 p. m.–6:00 p. m.
                  - generic [ref=e156]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e157]
                    - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e158]
                    - button "10:00 a. m.–11:00 a. m. · libre" [ref=e159] [cursor=pointer]:
                      - generic: 10 a. m.
                    - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e160]
                    - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e161]
                    - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e162]
                    - button "2:00 p. m.–3:00 p. m. · libre" [ref=e163] [cursor=pointer]:
                      - generic: 2 p. m.
                    - button "3:00 p. m.–4:00 p. m. · libre" [ref=e164] [cursor=pointer]:
                      - generic: 3 p. m.
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e165] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e166]
                    - button "6:00 p. m.–7:00 p. m. · libre" [ref=e167] [cursor=pointer]:
                      - generic: 6 p. m.
                    - button "7:00 p. m.–8:00 p. m." [disabled] [ref=e168]
                    - generic "Reservada · 8:00 a. m.–9:00 a. m." [ref=e169]:
                      - paragraph [ref=e170]: Reservada
                      - paragraph [ref=e171]: 8:00 a. m.–9:00 a. m.
                    - generic "Clases · 9:00 a. m.–10:00 a. m." [ref=e172]:
                      - paragraph [ref=e173]: Clases
                      - paragraph [ref=e174]: 9:00 a. m.–10:00 a. m.
                    - generic "Reservada · 11:00 a. m.–1:00 p. m." [ref=e175]:
                      - paragraph [ref=e176]: Reservada
                      - paragraph [ref=e177]: 11:00 a. m.–1:00 p. m.
                    - generic "Clases · 1:00 p. m.–2:00 p. m." [ref=e178]:
                      - paragraph [ref=e179]: Clases
                      - paragraph [ref=e180]: 1:00 p. m.–2:00 p. m.
                    - generic "Reservada · 5:00 p. m.–6:00 p. m." [ref=e181]:
                      - paragraph [ref=e182]: Reservada
                      - paragraph [ref=e183]: 5:00 p. m.–6:00 p. m.
                    - generic "Clases · 7:00 p. m.–8:00 p. m." [ref=e184]:
                      - paragraph [ref=e185]: Clases
                      - paragraph [ref=e186]: 7:00 p. m.–8:00 p. m.
                  - generic [ref=e187]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e188]
                    - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e189]
                    - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e190]
                    - button "11:00 a. m.–12:00 p. m. · libre" [ref=e191] [cursor=pointer]:
                      - generic: 11 a. m.
                    - button "12:00 p. m.–1:00 p. m. · libre" [ref=e192] [cursor=pointer]:
                      - generic: 12 p. m.
                    - button "1:00 p. m.–2:00 p. m." [disabled] [ref=e193]
                    - button "2:00 p. m.–3:00 p. m. · libre" [ref=e194] [cursor=pointer]:
                      - generic: 2 p. m.
                    - button "3:00 p. m.–4:00 p. m. · libre" [ref=e195] [cursor=pointer]:
                      - generic: 3 p. m.
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e196] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m. · libre" [ref=e197] [cursor=pointer]:
                      - generic: 5 p. m.
                    - button "6:00 p. m.–7:00 p. m." [disabled] [ref=e198]
                    - button "7:00 p. m.–8:00 p. m." [disabled] [ref=e199]
                    - generic "Clases · 8:00 a. m.–9:00 a. m." [ref=e200]:
                      - paragraph [ref=e201]: Clases
                      - paragraph [ref=e202]: 8:00 a. m.–9:00 a. m.
                    - generic "Reservada · 9:00 a. m.–10:00 a. m." [ref=e203]:
                      - paragraph [ref=e204]: Reservada
                      - paragraph [ref=e205]: 9:00 a. m.–10:00 a. m.
                    - generic "Clases · 10:00 a. m.–11:00 a. m." [ref=e206]:
                      - paragraph [ref=e207]: Clases
                      - paragraph [ref=e208]: 10:00 a. m.–11:00 a. m.
                    - generic "Clases · 1:00 p. m.–2:00 p. m." [ref=e209]:
                      - paragraph [ref=e210]: Clases
                      - paragraph [ref=e211]: 1:00 p. m.–2:00 p. m.
                    - generic "Reservada · 6:00 p. m.–8:00 p. m." [ref=e212]:
                      - paragraph [ref=e213]: Reservada
                      - paragraph [ref=e214]: 6:00 p. m.–8:00 p. m.
                  - generic [ref=e215]:
                    - button "8:00 a. m.–9:00 a. m. · libre" [ref=e216] [cursor=pointer]:
                      - generic: 8 a. m.
                    - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e217]
                    - button "10:00 a. m.–11:00 a. m. · libre" [ref=e218] [cursor=pointer]:
                      - generic: 10 a. m.
                    - button "11:00 a. m.–12:00 p. m. · libre" [ref=e219] [cursor=pointer]:
                      - generic: 11 a. m.
                    - button "12:00 p. m.–1:00 p. m. · libre" [ref=e220] [cursor=pointer]:
                      - generic: 12 p. m.
                    - button "1:00 p. m.–2:00 p. m. · libre" [ref=e221] [cursor=pointer]:
                      - generic: 1 p. m.
                    - button "2:00 p. m.–3:00 p. m. · libre" [ref=e222] [cursor=pointer]:
                      - generic: 2 p. m.
                    - button "3:00 p. m.–4:00 p. m. · libre" [ref=e223] [cursor=pointer]:
                      - generic: 3 p. m.
                    - button "4:00 p. m.–5:00 p. m." [disabled] [ref=e224]
                    - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e225]
                    - button "6:00 p. m.–7:00 p. m. · libre" [ref=e226] [cursor=pointer]:
                      - generic: 6 p. m.
                    - button "7:00 p. m.–8:00 p. m." [disabled] [ref=e227]
                    - generic "Reservada · 9:00 a. m.–10:00 a. m." [ref=e228]:
                      - paragraph [ref=e229]: Reservada
                      - paragraph [ref=e230]: 9:00 a. m.–10:00 a. m.
                    - generic "Reservada · 4:00 p. m.–6:00 p. m." [ref=e231]:
                      - paragraph [ref=e232]: Reservada
                      - paragraph [ref=e233]: 4:00 p. m.–6:00 p. m.
                    - generic "Reservada · 7:00 p. m.–8:00 p. m." [ref=e234]:
                      - paragraph [ref=e235]: Reservada
                      - paragraph [ref=e236]: 7:00 p. m.–8:00 p. m.
                  - generic [ref=e237]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e238]
                    - button "9:00 a. m.–10:00 a. m. · libre" [ref=e239] [cursor=pointer]:
                      - generic: 9 a. m.
                    - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e240]
                    - button "11:00 a. m.–12:00 p. m." [disabled] [ref=e241]
                    - button "12:00 p. m.–1:00 p. m. · libre" [ref=e242] [cursor=pointer]:
                      - generic: 12 p. m.
                    - button "1:00 p. m.–2:00 p. m. · libre" [ref=e243] [cursor=pointer]:
                      - generic: 1 p. m.
                    - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e244]
                    - button "3:00 p. m.–4:00 p. m. · libre" [ref=e245] [cursor=pointer]:
                      - generic: 3 p. m.
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e246] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m." [disabled] [ref=e247]
                    - button "6:00 p. m.–7:00 p. m." [disabled] [ref=e248]
                    - button "7:00 p. m.–8:00 p. m. · libre" [ref=e249] [cursor=pointer]:
                      - generic: 7 p. m.
                    - generic "Reservada · 8:00 a. m.–9:00 a. m." [ref=e250]:
                      - paragraph [ref=e251]: Reservada
                      - paragraph [ref=e252]: 8:00 a. m.–9:00 a. m.
                    - generic "Reservada · 10:00 a. m.–12:00 p. m." [ref=e253]:
                      - paragraph [ref=e254]: Reservada
                      - paragraph [ref=e255]: 10:00 a. m.–12:00 p. m.
                    - generic "Reservada · 2:00 p. m.–3:00 p. m." [ref=e256]:
                      - paragraph [ref=e257]: Reservada
                      - paragraph [ref=e258]: 2:00 p. m.–3:00 p. m.
                    - generic "Reservada · 5:00 p. m.–6:00 p. m." [ref=e259]:
                      - paragraph [ref=e260]: Reservada
                      - paragraph [ref=e261]: 5:00 p. m.–6:00 p. m.
                    - generic "Clases · 6:00 p. m.–7:00 p. m." [ref=e262]:
                      - paragraph [ref=e263]: Clases
                      - paragraph [ref=e264]: 6:00 p. m.–7:00 p. m.
                  - generic [ref=e265]:
                    - button "8:00 a. m.–9:00 a. m." [disabled] [ref=e266]
                    - button "9:00 a. m.–10:00 a. m." [disabled] [ref=e267]
                    - button "10:00 a. m.–11:00 a. m." [disabled] [ref=e268]
                    - button "11:00 a. m.–12:00 p. m. · libre" [ref=e269] [cursor=pointer]:
                      - generic: 11 a. m.
                    - button "12:00 p. m.–1:00 p. m." [disabled] [ref=e270]
                    - button "1:00 p. m.–2:00 p. m. · libre" [ref=e271] [cursor=pointer]:
                      - generic: 1 p. m.
                    - button "2:00 p. m.–3:00 p. m." [disabled] [ref=e272]
                    - button "3:00 p. m.–4:00 p. m. · libre" [ref=e273] [cursor=pointer]:
                      - generic: 3 p. m.
                    - button "4:00 p. m.–5:00 p. m. · libre" [ref=e274] [cursor=pointer]:
                      - generic: 4 p. m.
                    - button "5:00 p. m.–6:00 p. m. · libre" [ref=e275] [cursor=pointer]:
                      - generic: 5 p. m.
                    - button "6:00 p. m.–7:00 p. m." [disabled] [ref=e276]
                    - button "7:00 p. m.–8:00 p. m." [disabled] [ref=e277]
                    - generic "Reservada · 8:00 a. m.–10:00 a. m." [ref=e278]:
                      - paragraph [ref=e279]: Reservada
                      - paragraph [ref=e280]: 8:00 a. m.–10:00 a. m.
                    - generic "Clases · 10:00 a. m.–11:00 a. m." [ref=e281]:
                      - paragraph [ref=e282]: Clases
                      - paragraph [ref=e283]: 10:00 a. m.–11:00 a. m.
                    - generic "Reservada · 12:00 p. m.–1:00 p. m." [ref=e284]:
                      - paragraph [ref=e285]: Reservada
                      - paragraph [ref=e286]: 12:00 p. m.–1:00 p. m.
                    - generic "Clases · 2:00 p. m.–3:00 p. m." [ref=e287]:
                      - paragraph [ref=e288]: Clases
                      - paragraph [ref=e289]: 2:00 p. m.–3:00 p. m.
                    - generic "Clases · 6:00 p. m.–8:00 p. m." [ref=e290]:
                      - paragraph [ref=e291]: Clases
                      - paragraph [ref=e292]: 6:00 p. m.–8:00 p. m.
              - list [ref=e293]:
                - listitem [ref=e294]: Libre
                - listitem [ref=e296]: Reservada
                - listitem [ref=e298]: Bloqueada
                - listitem [ref=e300]: Tu reserva
                - listitem [ref=e302]: Seleccionada
            - complementary [ref=e304]:
              - generic [ref=e305]:
                - region "Panorama de Cancha múltiple 1" [ref=e306]:
                  - generic: Panorama 360°
                  - status [ref=e307]:
                    - paragraph [ref=e308]: No se pudo mostrar el panorama
                    - paragraph [ref=e309]: No se pudo iniciar la vista 360°. Comprueba que tu navegador permita WebGL y vuelve a intentar.
                    - paragraph [ref=e310]: Ilustración 2D de referencia
                    - button "Volver a intentar" [ref=e311] [cursor=pointer]
                - paragraph [ref=e318]:
                  - generic [ref=e319]: Haz clic en una franja libre del calendario, o arrastra para elegir hasta
                  - text: 2 franjas consecutivas. Tolerancia de 10 min tras el inicio.
    - button "Contactar al administrador" [ref=e320] [cursor=pointer]
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