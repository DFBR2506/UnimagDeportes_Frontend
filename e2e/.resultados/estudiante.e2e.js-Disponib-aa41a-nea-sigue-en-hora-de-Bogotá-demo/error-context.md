# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/estudiante.e2e.js >> Disponibilidad >> otra zona horaria >> [DIS-21] la línea sigue en hora de Bogotá
- Location: e2e/demo/estudiante.e2e.js:233:5

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('[aria-busy] > div.border-l').first().locator('div.z-20')
Expected pattern: /top: 130px/
Received string:  "top: 442px;"
Timeout: 3000ms

Call log:
  - Expect "toHaveAttribute" locator('[aria-busy] > div.border-l').first().locator('div.z-20') with timeout 3000ms
  - waiting for locator('[aria-busy] > div.border-l').first().locator('div.z-20')
    4 × locator resolved to <div class="pointer-events-none absolute inset-x-0 z-20">…</div>
      - unexpected value "top: 442px;"

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
                - paragraph [ref=e65]: En vivo · 10:30 a. m.
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
                    - button "11:00 a. m.–12:00 p. m. · libre" [ref=e110] [cursor=pointer]:
                      - generic: 11 a. m.
                    - button "12:00 p. m.–1:00 p. m. · libre" [ref=e111] [cursor=pointer]:
                      - generic: 12 p. m.
                    - button "1:00 p. m.–2:00 p. m. · libre" [ref=e112] [cursor=pointer]:
                      - generic: 1 p. m.
                    - button "2:00 p. m.–3:00 p. m. · libre" [ref=e113] [cursor=pointer]:
                      - generic: 2 p. m.
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
                    - status "Cargando panorama" [ref=e308]
                    - paragraph [ref=e310]: Cargando panorama…
                - paragraph [ref=e312]:
                  - generic [ref=e313]: Haz clic en una franja libre del calendario, o arrastra para elegir hasta
                  - text: 2 franjas consecutivas. Tolerancia de 10 min tras el inicio.
    - button "Contactar al administrador" [ref=e314] [cursor=pointer]
  - generic:
    - region "Notifications"
```

# Test source

```ts
  137 |       const k = 'ud-demo-state-v1', s = JSON.parse(localStorage.getItem(k))
  138 |       s.blocks = horas.slice(1).map((h) => ({ id: `b${h}`, spaceId: id, date, startHour: h, endHour: h + 1, reason: 'x', type: 'CLASS' }))
  139 |       localStorage.setItem(k, JSON.stringify(s))
  140 |     }, { horas, id: ID.multiple1, date: HOY })
  141 |     await page.goto('/app/disponibilidad')
  142 |     await expect(page.getByRole('button', { name: /múltiple 1.*1 franjas? libres? hoy/ })).toBeVisible()
  143 |     await expect(page.getByRole('button', { name: /1 franja libre hoy/ })).toBeVisible({ timeout: 1500 })
  144 |   })
  145 | 
  146 |   test('[DIS-05] sin canchas activas', async ({ page, demo }) => {
  147 |     const state = estado()
  148 |     state.spaces.forEach((s) => (s.status = 'MAINTENANCE'))
  149 |     await demo({ state })
  150 |     await page.goto('/app/disponibilidad')
  151 |     await expect(page.getByText('No hay espacios disponibles')).toBeVisible()
  152 |   })
  153 | 
  154 |   test('[DIS-06] cancha inexistente o en mantenimiento', async ({ page, demo }) => {
  155 |     await demo()
  156 |     for (const id of ['no-existe', ID.futbol5]) {
  157 |       await page.goto(`/app/disponibilidad/${id}`)
  158 |       await expect(page).toHaveURL(/disponibilidad$/)
  159 |     }
  160 |   })
  161 | 
  162 |   test('[DIS-10][DIS-11][DIS-12] 7 días, horizonte y pasado', async ({ page, demo }) => {
  163 |     await demo()
  164 |     await abrirCancha(page)
  165 |     await expect(page.locator('[aria-busy] > div.border-l')).toHaveCount(7)
  166 |     await expect(columna(page, 0).locator('button')).toHaveCount(12)
  167 |     for (const h of [8, 9]) await expect(celda(page, 0, h)).toBeDisabled()
  168 |     await page.getByRole('button', { name: 'Semana siguiente' }).click()
  169 |     await expect(page.getByRole('button', { name: 'Semana siguiente' })).toBeDisabled()
  170 |     await expect.poll(() => columna(page, 1).locator('button:not([disabled])').count()).toBe(0)
  171 |   })
  172 | 
  173 |   test('[DIS-11] la demo usa el mismo horizonte que el backend (hoy + 6)', async ({ page, demo }) => {
  174 |     test.fail(true, 'QA-28: el simulador quedó en 7 días y el backend pasó a 6')
  175 |     await demo()
  176 |     await page.goto('/app/mis-reservas/reglas')
  177 |     const fila = page.locator('dl > div', { hasText: 'Anticipación máxima' })
  178 |     await expect(fila).toContainText(/\d días/)
  179 |     await page.waitForTimeout(1000)
  180 |     await expect(fila).toContainText('6 días', { timeout: 1500 })
  181 |   })
  182 | 
  183 |   for (const [id, min, ok] of [['DIS-13', 9, true], ['DIS-14', 11, false]]) {
  184 |     test(`[${id}] minuto ${min} de la franja en curso`, async ({ page, demo }) => {
  185 |       // se busca una hora libre de hoy para situar el reloj dentro de ella
  186 |       await demo({ time: `${HOY}T06:00:00-05:00` })
  187 |       await abrirCancha(page)
  188 |       const label = await libres(page, 0).first().getAttribute('aria-label')
  189 |       const index = await columna(page, 0).locator('button').evaluateAll((els, l) => els.findIndex((e) => e.getAttribute('aria-label') === l), label)
  190 |       const hour = 8 + index
  191 |       await page.clock.setFixedTime(new Date(`${HOY}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00-05:00`))
  192 |       await abrirCancha(page)
  193 |       await expect(celda(page, 0, hour)).toBeEnabled({ enabled: ok })
  194 |     })
  195 |   }
  196 | 
  197 |   test('[DIS-15][DIS-16] motivos visibles y sin nombres', async ({ page, demo }) => {
  198 |     await demo({ state: estado({ blocks: [{ id: 'b', spaceId: ID.multiple1, date: MANANA, startHour: 9, endHour: 11, reason: 'Torneo interno', type: 'EVENT' }] }) })
  199 |     await abrirCancha(page)
  200 |     await expect(columna(page, 1).locator('[title^="Torneo interno · 9:00 a. m."]')).toBeVisible()
  201 |     for (const t of await page.locator('[title^="Reservada"]').allTextContents()) expect(t).toMatch(/^Reservada/)
  202 |   })
  203 | 
  204 |   test('[DIS-17] la propia se distingue al entrar desde el menú', async ({ page, demo }) => {
  205 |     await demo({ state: estado({ reservations: [reserva('r', { hour: 14 })] }) })
  206 |     await page.goto('/app/inicio')
  207 |     await expect(page.getByText('Próxima: Cancha múltiple 1')).toBeVisible()
  208 |     await page.getByRole('button', { name: 'Consultar disponibilidad' }).click()
  209 |     await page.getByRole('button', { name: /múltiple 1.*Ver horario/ }).click()
  210 |     await expect(page.locator('[title^="Tu reserva"]')).toBeVisible()
  211 |   })
  212 | 
  213 |   test('[DIS-19] cambiar de disciplina no cambia la ocupación', async ({ page, demo }) => {
  214 |     await demo()
  215 |     await abrirCancha(page)
  216 |     const titles = () => page.locator('[aria-busy="false"] [title]').evaluateAll((e) => e.map((x) => x.title))
  217 |     const before = await titles()
  218 |     expect(before.length).toBeGreaterThan(0)
  219 |     await page.getByRole('button', { name: 'Voleibol' }).click()
  220 |     await expect(page.getByRole('button', { name: 'Voleibol' })).toHaveAttribute('aria-pressed', 'true')
  221 |     await page.waitForTimeout(1000)
  222 |     await expect.poll(titles).toEqual(before)
  223 |   })
  224 | 
  225 |   test('[DIS-20] la línea roja marca la hora', async ({ page, demo }) => {
  226 |     await demo()
  227 |     await abrirCancha(page)
  228 |     await expect(columna(page, 0).locator('div.z-20')).toHaveAttribute('style', /top: 130px/) // (10,5−8)×52
  229 |   })
  230 | 
  231 |   test.describe('otra zona horaria', () => {
  232 |     test.use({ timezoneId: 'Europe/Madrid' })
  233 |     test('[DIS-21] la línea sigue en hora de Bogotá', async ({ page, demo }) => {
  234 |       test.fail(true, 'QA-04')
  235 |       await demo()
  236 |       await abrirCancha(page)
> 237 |       await expect(columna(page, 0).locator('div.z-20')).toHaveAttribute('style', /top: 130px/, { timeout: 3000 })
      |                                                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  238 |     })
  239 |     test('[TRX-55] reservar y ver la cuota desde otra zona', async ({ page, demo }) => {
  240 |       await demo()
  241 |       await abrirCancha(page)
  242 |       await reservarPrimera(page, 1)
  243 |       await expect(page.locator('dl')).toContainText('Miércoles, 25 de noviembre')
  244 |       await confirmar(page).click()
  245 |       await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  246 |       await page.goto('/app/mis-reservas/cuota')
  247 |       await expect(page.getByText('23 de noviembre al 29 de noviembre', { exact: false })).toBeVisible()
  248 |     })
  249 |   })
  250 | 
  251 |   test('[DIS-22] semana que cruza de mes', async ({ page, demo }) => {
  252 |     await demo({ time: '2026-11-27T10:30:00-05:00' })
  253 |     await abrirCancha(page)
  254 |     await expect(page.getByRole('heading', { level: 2, name: /Nov.*diciembre/i })).toBeVisible()
  255 |   })
  256 | })
  257 | 
  258 | test.describe('Selección', () => {
  259 |   const seguidas = async (page, n) => {
  260 |     for (let d = 1; d < 7; d++) {
  261 |       const enabled = await columna(page, d).locator('button').evaluateAll((els) => els.map((e) => !e.disabled))
  262 |       for (let i = 0; i + n <= enabled.length; i++) if (enabled.slice(i, i + n).every(Boolean)) return { d, i }
  263 |     }
  264 |     throw new Error(`sin ${n} franjas libres seguidas`)
  265 |   }
  266 |   const fila = (page, { d, i }, k = 0) => columna(page, d).locator('button').nth(i + k)
  267 | 
  268 |   test('[DIS-30][DIS-31][DIS-32][DIS-35] clic, extender, límite y quitar', async ({ page, demo }) => {
  269 |     await demo()
  270 |     await abrirCancha(page)
  271 |     const s = await seguidas(page, 3)
  272 |     await fila(page, s).click()
  273 |     await expect(panel(page)).toContainText('· 1 h ·')
  274 |     await fila(page, s, 1).click({ force: true })
  275 |     await expect(panel(page)).toContainText('· 2 h ·')
  276 |     await fila(page, s, 2).click({ force: true })
  277 |     await expect(panel(page)).toContainText('· 1 h ·')
  278 |     await page.getByRole('button', { name: 'Quitar' }).locator('visible=true').click()
  279 |     await expect(page.getByText('Franja seleccionada').locator('visible=true')).toHaveCount(0)
  280 |     await fila(page, s).click()
  281 |     await fila(page, s).click({ force: true })
  282 |     await expect(page.getByText('Franja seleccionada').locator('visible=true')).toHaveCount(0)
  283 |   })
  284 | 
  285 |   test('[DIS-33] arrastrar se limita a 2 h', async ({ page, demo }) => {
  286 |     await demo()
  287 |     await abrirCancha(page)
  288 |     const s = await seguidas(page, 3)
  289 |     await fila(page, s).scrollIntoViewIfNeeded()
  290 |     const a = await fila(page, s).boundingBox(), b = await fila(page, s, 2).boundingBox()
  291 |     await page.mouse.move(a.x + 20, a.y + 20)
  292 |     await page.mouse.down()
  293 |     await page.mouse.move(b.x + 20, b.y + 20, { steps: 10 })
  294 |     await page.mouse.up()
  295 |     await expect(panel(page)).toContainText('· 2 h ·')
  296 |   })
  297 | 
  298 |   test('[DIS-34] arrastrar sobre una ocupada no la incluye', async ({ page, demo }) => {
  299 |     await demo()
  300 |     await abrirCancha(page)
  301 |     let hit
  302 |     for (let d = 1; d < 7 && !hit; d++) {
  303 |       const e = await columna(page, d).locator('button').evaluateAll((els) => els.map((x) => !x.disabled))
  304 |       const i = e.findIndex((v, k) => v && e[k + 1] === false)
  305 |       if (i >= 0) hit = { d, i }
  306 |     }
  307 |     await fila(page, hit).scrollIntoViewIfNeeded()
  308 |     const a = await fila(page, hit).boundingBox()
  309 |     await page.mouse.move(a.x + 20, a.y + 20)
  310 |     await page.mouse.down()
  311 |     await page.mouse.move(a.x + 20, a.y + 80, { steps: 6 })
  312 |     await page.mouse.up()
  313 |     await expect(panel(page)).toContainText('· 1 h ·')
  314 |   })
  315 | 
  316 |   test('[DIS-36] solo queda la última, aunque sea otro día', async ({ page, demo }) => {
  317 |     await demo()
  318 |     await abrirCancha(page)
  319 |     await libres(page, 1).first().click()
  320 |     await libres(page, 2).first().click()
  321 |     await expect(panel(page)).toContainText('Jueves, 26 de noviembre')
  322 |     await expect(page.getByText('Nueva reserva', { exact: true })).toHaveCount(1)
  323 |   })
  324 | 
  325 |   test('[DIS-37][TRX-20] reservar solo con teclado @firefox', async ({ page, demo }) => {
  326 |     await demo()
  327 |     await abrirCancha(page)
  328 |     const cell = libres(page, 1).first()
  329 |     await cell.focus()
  330 |     await page.keyboard.press('Enter')
  331 |     await expect(panel(page)).toContainText('· 1 h ·')
  332 |     const next = page.getByRole('button', { name: /^Continuar/ }).locator('visible=true')
  333 |     await next.focus()
  334 |     await page.keyboard.press('Enter')
  335 |     await expect(titulo(page, 'Confirma tu reserva')).toBeVisible()
  336 |     await confirmar(page).focus()
  337 |     await page.keyboard.press('Enter')
```