import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.route("https://www.google.com/recaptcha/api.js**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "window.grecaptcha={ready:function(callback){callback();},execute:function(){return Promise.resolve('e2e-token');}};",
    }),
  );
});

test("home localizada, navegación de proyecto e idioma equivalente", async ({ page }) => {
  await page.goto("/es/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Desarrollador");

  await page.locator(".project-case-link").first().click();
  await expect(page).toHaveURL(/\/es\/projects\/capdi\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Capdi");

  await page.locator("[data-language-target='en']").click();
  await expect(page).toHaveURL(/\/en\/projects\/capdi\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.context().cookies()).resolves.toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "portfolio_lang", value: "en" })]),
  );
});

test("la raíz prioriza cookie, luego Accept-Language y conserva el fallback", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:4321/");
  await expect(page).toHaveURL(/\/en\/$/);

  await context.addCookies([
    { name: "portfolio_lang", value: "es", url: "http://127.0.0.1:4321" },
  ]);
  await page.goto("http://127.0.0.1:4321/");
  await expect(page).toHaveURL(/\/es\/$/);

  await context.close();
});

test("menú y jerarquía móvil mantienen el mensaje antes del cubo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/es/");

  const copyBox = await page.locator(".hero-copy").boundingBox();
  const cubeBox = await page.locator(".hero-cube").boundingBox();
  expect(copyBox).not.toBeNull();
  expect(cubeBox).not.toBeNull();
  expect(copyBox!.y).toBeLessThan(cubeBox!.y);

  const menuButton = page.locator("[data-menu-button]");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[data-mobile-nav]")).toBeVisible();
  await page.locator("[data-mobile-nav] a[href='#projects']").click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/\/es\/#projects$/);
});

test("formulario valida por campo y anuncia el éxito", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, code: "SENT" }),
    });
  });
  await page.goto("/es/#contact");

  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.locator("[data-error-for='name']")).toBeVisible();

  await page.getByLabel("Nombre").fill("Persona de prueba");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("test@example.com");
  await page.getByLabel("Asunto").fill("Nuevo proyecto");
  await page.getByLabel("Mensaje").fill("Mensaje de prueba suficientemente largo.");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();

  await expect(page.locator("[data-contact-status]")).toContainText("Tu mensaje fue enviado", {
    timeout: 10_000,
  });
});

test("reduced motion funciona al cargar y al cambiar en vivo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/");
  await expect(page.locator("[data-reveal]").first()).toHaveCSS("opacity", "1");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(100);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-reveal]").first()).toHaveCSS("opacity", "1");
});

test("el cubo viaja libre, no bloquea la pagina y termina girando en el footer", async ({ page, browserName }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/es/");

  const journey = page.locator("[data-cube-root]");
  await expect(journey).toHaveAttribute("aria-hidden", "true");
  await expect(journey).toHaveCSS("pointer-events", "none");
  await expect(journey.locator(".rubik-panel, [data-cube-fallback], button")).toHaveCount(0);

  // WebGL availability varies in CI for Firefox/WebKit. The DOM and scroll
  // safety contract still applies there; Chromium exercises the full trip.
  if (browserName !== "chromium") return;

  await expect(journey.locator("canvas")).toHaveCount(1, { timeout: 10_000 });
  await expect(journey).toHaveClass(/is-ready/);
  await page.waitForTimeout(150);
  const traveller = page.locator("[data-cube-float]");
  const actions = await page.locator(".hero-actions").boundingBox();
  const initialCube = await traveller.boundingBox();
  expect(actions).not.toBeNull();
  expect(initialCube).not.toBeNull();
  expect(actions!.y + actions!.height).toBeLessThanOrEqual(initialCube!.y + 2);
  const viewportWidth = page.viewportSize()?.width ?? 390;

  const poses = [
    { selector: "#experience", bias: 0.55, side: "left" },
    { selector: "#about", bias: 0.5, side: "right" },
    { selector: "#contact", bias: 0.52, side: "left" },
  ] as const;

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  for (const pose of poses) {
    await page.evaluate(({ selector, bias }) => {
      const section = document.querySelector<HTMLElement>(selector);
      if (section) window.scrollTo(0, section.offsetTop - window.innerHeight * bias);
    }, pose);
    await page.waitForTimeout(550);
    const box = await traveller.boundingBox();
    expect(box).not.toBeNull();
    const center = box!.x + box!.width / 2;
    if (pose.side === "left") expect(center).toBeLessThan(viewportWidth / 2);
    else expect(center).toBeGreaterThan(viewportWidth / 2);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  expect(Number(await journey.getAttribute("data-journey-progress"))).toBeGreaterThan(0.98);
  await expect
    .poll(async () => Number.parseFloat(await traveller.evaluate((element) => getComputedStyle(element).opacity)))
    .toBeGreaterThanOrEqual(0.9);
  await expect(journey).toHaveAttribute("data-cube-focus", "footer");
  await expect(journey.locator("[data-cube-stage]")).toHaveAttribute("data-cube-state", "idle");

  const dockDistance = await page.evaluate(() => {
    const travellerElement = document.querySelector<HTMLElement>("[data-cube-float]");
    const dock = document.querySelector<HTMLElement>("[data-cube-footer-dock]");
    if (!travellerElement || !dock) return Number.POSITIVE_INFINITY;
    const cubeRect = travellerElement.getBoundingClientRect();
    const dockRect = dock.getBoundingClientRect();
    return Math.hypot(
      cubeRect.left + cubeRect.width / 2 - (dockRect.left + dockRect.width / 2),
      cubeRect.top + cubeRect.height / 2 - (dockRect.top + dockRect.height / 2),
    );
  });
  expect(dockDistance).toBeLessThanOrEqual(6);

  const dockBox = await page.locator("[data-cube-footer-dock]").boundingBox();
  expect(dockBox).not.toBeNull();
  const rotationClip = {
    x: Math.max(0, dockBox!.x - 24),
    y: Math.max(0, dockBox!.y - 24),
    width: dockBox!.width + 48,
    height: dockBox!.height + 48,
  };
  const firstFrame = await page.screenshot({ clip: rotationClip });
  await page.waitForTimeout(500);
  const secondFrame = await page.screenshot({ clip: rotationClip });
  expect(firstFrame.equals(secondFrame)).toBeFalsy();
  await page.screenshot({
    path: testInfo.outputPath("cube-footer-dock.png"),
    fullPage: false,
  });
});

test("los cambios de lateral ocurren debajo del contenido de cada sección", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium", "Chromium exercises the live WebGL journey.");
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/es/");
  await expect(page.locator("[data-cube-root] canvas")).toHaveCount(1, {
    timeout: 10_000,
  });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const corridors = [
    { outgoing: "#projects .project-grid", incoming: "#experience .section-heading" },
    { outgoing: "#experience .timeline", incoming: "#about .section-heading" },
    { outgoing: "#about .about-grid", incoming: "#contact .section-heading" },
  ];

  for (const [corridorIndex, corridor] of corridors.entries()) {
    const range = await page.evaluate(({ outgoing, incoming }) => {
      const outgoingElement = document.querySelector<HTMLElement>(outgoing);
      const incomingElement = document.querySelector<HTMLElement>(incoming);
      if (!outgoingElement || !incomingElement) return null;
      const outgoingBottom =
        outgoingElement.getBoundingClientRect().bottom + window.scrollY;
      const incomingTop =
        incomingElement.getBoundingClientRect().top + window.scrollY;
      return {
        start: Math.max(0, outgoingBottom - window.innerHeight),
        end: Math.min(
          document.documentElement.scrollHeight - window.innerHeight,
          incomingTop - window.innerHeight * 0.45,
        ),
      };
    }, corridor);
    expect(range).not.toBeNull();

    let bestScroll = range!.start;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let step = 0; step <= 16; step += 1) {
      const scrollY =
        range!.start + (range!.end - range!.start) * (step / 16);
      await page.evaluate((top) => window.scrollTo(0, top), scrollY);
      await page.waitForTimeout(70);
      const centerX = await page.locator("[data-cube-float]").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      const distance = Math.abs(centerX - 720);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestScroll = scrollY;
      }
    }

    await page.evaluate((top) => window.scrollTo(0, top), bestScroll);
    await page.waitForTimeout(500);
    const geometry = await page.evaluate(({ outgoing, incoming }) => {
      const traveller = document.querySelector<HTMLElement>("[data-cube-float]");
      const outgoingElement = document.querySelector<HTMLElement>(outgoing);
      const incomingElement = document.querySelector<HTMLElement>(incoming);
      if (!traveller || !outgoingElement || !incomingElement) return null;
      const cube = traveller.getBoundingClientRect();
      const crop = cube.height * 0.16;
      return {
        centerX: cube.left + cube.width / 2,
        visualTop: cube.top + crop,
        visualBottom: cube.bottom - crop,
        outgoingBottom: outgoingElement.getBoundingClientRect().bottom,
        incomingTop: incomingElement.getBoundingClientRect().top,
      };
    }, corridor);
    expect(geometry).not.toBeNull();
    expect(Math.abs(geometry!.centerX - 720)).toBeLessThan(170);
    expect(geometry!.visualTop).toBeGreaterThanOrEqual(
      geometry!.outgoingBottom - 8,
    );
    expect(geometry!.visualBottom).toBeLessThanOrEqual(
      geometry!.incomingTop + 8,
    );
    await page.screenshot({
      path: testInfo.outputPath(`cube-corridor-${corridorIndex + 1}.png`),
      fullPage: false,
    });
  }
});

test("ClientRouter no duplica canvas, progreso ni artefactos de pin", async ({ page }) => {
  await page.goto("/es/");
  await page.waitForTimeout(2_500);
  expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
  await expect(page.locator("[data-scroll-progress]")).toHaveCount(1);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);

  for (let index = 0; index < 2; index += 1) {
    await page.locator(".project-case-link").first().click();
    await expect(page).toHaveURL(/\/es\/projects\/capdi\/$/);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-scroll-progress]")).toHaveCount(1);
    await page.locator(".back-link").click();
    await expect(page).toHaveURL(/\/es\/#projects$/);
  }

  expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
  await expect(page.locator("[data-scroll-progress]")).toHaveCount(1);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("la home no presenta violaciones Axe WCAG AA", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("responsive sin overflow en los cinco breakpoints de aceptación", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const viewports = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/es/");
    await page.waitForTimeout(1_100);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    if (viewport.width <= 390) {
      const actions = await page.locator(".hero-actions").boundingBox();
      const cube = await page.locator(".hero-cube").boundingBox();
      expect(actions).not.toBeNull();
      expect(cube).not.toBeNull();
      expect(actions!.y + actions!.height).toBeLessThan(cube!.y);
    }

    await page.screenshot({
      path: testInfo.outputPath(`home-${viewport.width}.png`),
      fullPage: false,
    });
    if (viewport.width === 390 || viewport.width === 1440) {
      await page.evaluate(async () => {
        const step = Math.max(300, window.innerHeight * 0.75);
        for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
          window.scrollTo(0, position);
          await new Promise((resolve) => window.setTimeout(resolve, 50));
        }
        window.scrollTo(0, document.documentElement.scrollHeight);
        await new Promise((resolve) => window.setTimeout(resolve, 100));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: testInfo.outputPath(`home-${viewport.width}-full.png`),
        fullPage: true,
      });
    }
  }
});
