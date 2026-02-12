import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { isoTimestampForFile, loadMergedEnv, resolveDatabaseUrl } from './_env-utils.mjs';

const SMALL_PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl9x98AAAAASUVORK5CYII=';

function sanitizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/u, '');
}

function isTruthy(value) {
    return String(value || '').toLowerCase() === 'true';
}

async function apiRequest(baseUrl, accessToken, endpointPath, options = {}) {
    const method = options.method || 'GET';
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);

    let body;
    if (options.json) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(options.json);
    } else if (options.formData) {
        body = options.formData;
    }

    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/api${endpointPath}`, {
        method,
        headers,
        body,
    });
    const elapsedMs = Date.now() - startedAt;

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch {
        data = rawText;
    }

    return {
        response,
        elapsedMs,
        data,
    };
}

async function run() {
    const env = loadMergedEnv();
    const baseUrl = sanitizeBaseUrl(env.KF_E2E_BASE_URL);
    const email = String(env.KF_E2E_EMAIL || '').trim();
    const password = String(env.KF_E2E_PASSWORD || '').trim();
    const allowMutation = isTruthy(env.KF_E2E_ALLOW_PROD_MUTATION);

    if (!allowMutation) {
        throw new Error('Aborted. Set KF_E2E_ALLOW_PROD_MUTATION=true for production mutation tests.');
    }
    if (!baseUrl) {
        throw new Error('Missing KF_E2E_BASE_URL.');
    }
    if (!email || !password) {
        throw new Error('Missing KF_E2E_EMAIL or KF_E2E_PASSWORD.');
    }

    let playwright;
    try {
        playwright = await import('playwright');
    } catch {
        throw new Error('Missing playwright package. Install it before running test:prod:smoke.');
    }

    const runId = isoTimestampForFile();
    const artifactsDir = path.join(process.cwd(), 'reports', 'artifacts');
    await mkdir(artifactsDir, { recursive: true });

    const report = {
        generated_at: new Date().toISOString(),
        run_id: runId,
        base_url: baseUrl,
        allow_prod_mutation: allowMutation,
        steps: [],
        created_order_id: null,
        deleted_order: false,
        post_delete_404_verified: false,
        post_delete_child_rows_verified: null,
        success: false,
        error: null,
        screenshots: {},
    };

    const recordStep = (name, details = {}) => {
        report.steps.push({
            name,
            at: new Date().toISOString(),
            ...details,
        });
    };

    let browser;
    let context;
    let page;
    let accessToken = '';
    let createdOrderId = null;
    let prisma;
    let orderToken = '';

    try {
        browser = await playwright.chromium.launch({ headless: true });
        context = await browser.newContext();
        page = await context.newPage();

        await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        const loginScreenshot = path.join(artifactsDir, `prod-login-${runId}.png`);
        await page.screenshot({ path: loginScreenshot, fullPage: true });
        report.screenshots.login = loginScreenshot;
        recordStep('browser_login_page_loaded', { ok: true });

        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await Promise.all([
            page.waitForURL('**/dashboard', { timeout: 30_000 }),
            page.click('button[type="submit"]'),
        ]);

        const dashboardScreenshot = path.join(artifactsDir, `prod-dashboard-${runId}.png`);
        await page.screenshot({ path: dashboardScreenshot, fullPage: true });
        report.screenshots.dashboard = dashboardScreenshot;
        recordStep('browser_login_success', { ok: true });

        await page.goto(`${baseUrl}/orders/new`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForSelector('h1:text("New Order")', { timeout: 30_000 });
        const newOrderScreenshot = path.join(artifactsDir, `prod-new-order-${runId}.png`);
        await page.screenshot({ path: newOrderScreenshot, fullPage: true });
        report.screenshots.new_order = newOrderScreenshot;
        recordStep('browser_new_order_page_loaded', { ok: true });

        accessToken = await page.evaluate(() => localStorage.getItem('token') || '');
        if (!accessToken) {
            throw new Error('Login succeeded but access token is missing in localStorage.');
        }

        orderToken = `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const billNumber = orderToken;
        const today = new Date();
        const entryDate = today.toISOString().slice(0, 10);
        const deliveryDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const createForm = new FormData();
        createForm.set('token', orderToken);
        createForm.set('bill_number', billNumber);
        createForm.set('customer_name', 'Audit Smoke User');
        createForm.set('entry_date', entryDate);
        createForm.set('delivery_date', deliveryDate);
        createForm.set('remarks', `Automated smoke test ${runId}`);
        createForm.set('total_amount', '999');

        const imageBuffer = Buffer.from(SMALL_PNG_BASE64, 'base64');
        const imageFile = new File([imageBuffer], 'audit.png', { type: 'image/png' });
        createForm.append('images[]', imageFile);

        const createOrderResult = await apiRequest(baseUrl, accessToken, '/orders', {
            method: 'POST',
            formData: createForm,
        });
        recordStep('api_create_order', {
            ok: createOrderResult.response.ok,
            status: createOrderResult.response.status,
            elapsed_ms: createOrderResult.elapsedMs,
        });
        if (!createOrderResult.response.ok || !createOrderResult.data?.id) {
            throw new Error(`Order create failed: ${JSON.stringify(createOrderResult.data)}`);
        }

        createdOrderId = Number(createOrderResult.data.id);
        report.created_order_id = createdOrderId;

        const detailAfterCreate = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}`);
        recordStep('api_get_created_order', {
            ok: detailAfterCreate.response.ok,
            status: detailAfterCreate.response.status,
            elapsed_ms: detailAfterCreate.elapsedMs,
            images_count: Array.isArray(detailAfterCreate.data?.images) ? detailAfterCreate.data.images.length : 0,
        });
        if (!detailAfterCreate.response.ok) {
            throw new Error(`Failed to fetch created order: ${JSON.stringify(detailAfterCreate.data)}`);
        }

        const updateResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}`, {
            method: 'PUT',
            json: {
                customer_name: 'Audit Smoke User Updated',
                remarks: `Updated in smoke test ${runId}`,
                total_amount: 1111,
            },
        });
        recordStep('api_update_order', {
            ok: updateResult.response.ok,
            status: updateResult.response.status,
            elapsed_ms: updateResult.elapsedMs,
        });
        if (!updateResult.response.ok) {
            throw new Error(`Order update failed: ${JSON.stringify(updateResult.data)}`);
        }

        const paymentResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}/payments`, {
            method: 'POST',
            json: {
                amount: 123,
                payment_date: entryDate,
                payment_method: 'cash',
                note: 'Smoke test payment',
            },
        });
        recordStep('api_add_payment', {
            ok: paymentResult.response.ok,
            status: paymentResult.response.status,
            elapsed_ms: paymentResult.elapsedMs,
        });
        if (!paymentResult.response.ok) {
            throw new Error(`Payment creation failed: ${JSON.stringify(paymentResult.data)}`);
        }

        const deliveredResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}/status`, {
            method: 'PUT',
            json: {
                status: 'delivered',
                payment_amount: 50,
                payment_method: 'online',
                actual_delivery_date: entryDate,
                note: 'Smoke test delivery',
            },
        });
        recordStep('api_mark_delivered', {
            ok: deliveredResult.response.ok,
            status: deliveredResult.response.status,
            elapsed_ms: deliveredResult.elapsedMs,
        });
        if (!deliveredResult.response.ok) {
            throw new Error(`Status update failed: ${JSON.stringify(deliveredResult.data)}`);
        }

        const deleteResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}`, {
            method: 'DELETE',
        });
        report.deleted_order = deleteResult.response.ok;
        recordStep('api_delete_order', {
            ok: deleteResult.response.ok,
            status: deleteResult.response.status,
            elapsed_ms: deleteResult.elapsedMs,
        });
        if (!deleteResult.response.ok) {
            throw new Error(`Order deletion failed: ${JSON.stringify(deleteResult.data)}`);
        }

        const fetchAfterDeleteResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}`);
        report.post_delete_404_verified = fetchAfterDeleteResult.response.status === 404;
        recordStep('api_verify_deleted_order_404', {
            ok: report.post_delete_404_verified,
            status: fetchAfterDeleteResult.response.status,
            elapsed_ms: fetchAfterDeleteResult.elapsedMs,
        });
        if (!report.post_delete_404_verified) {
            throw new Error('Deleted order did not return 404.');
        }

        const databaseUrl = resolveDatabaseUrl(env);
        if (databaseUrl) {
            process.env.DATABASE_URL = databaseUrl;
            prisma = new PrismaClient({ errorFormat: 'minimal' });

            const [orderCount, imageCount, paymentCount, logCount] = await Promise.all([
                prisma.order.count({ where: { id: createdOrderId } }),
                prisma.orderImage.count({ where: { orderId: createdOrderId } }),
                prisma.payment.count({ where: { orderId: createdOrderId } }),
                prisma.orderLog.count({ where: { orderId: createdOrderId } }),
            ]);

            report.post_delete_child_rows_verified = {
                order_count: orderCount,
                order_images_count: imageCount,
                payments_count: paymentCount,
                order_logs_count: logCount,
                ok: orderCount === 0 && imageCount === 0 && paymentCount === 0 && logCount === 0,
            };

            recordStep('db_verify_no_child_rows_after_delete', report.post_delete_child_rows_verified);
            if (!report.post_delete_child_rows_verified.ok) {
                throw new Error('Child rows still exist after delete.');
            }
        } else {
            report.post_delete_child_rows_verified = {
                ok: false,
                skipped: true,
                reason: 'No DB URL available for post-delete child-row verification.',
            };
            recordStep('db_verify_no_child_rows_after_delete', report.post_delete_child_rows_verified);
        }

        report.success = true;
    } catch (error) {
        report.error = error instanceof Error ? error.message : String(error);
        report.success = false;
    } finally {
        if (createdOrderId && !report.deleted_order && accessToken) {
            try {
                const cleanupResult = await apiRequest(baseUrl, accessToken, `/orders/${createdOrderId}`, {
                    method: 'DELETE',
                });
                recordStep('cleanup_delete_order', {
                    ok: cleanupResult.response.ok,
                    status: cleanupResult.response.status,
                    elapsed_ms: cleanupResult.elapsedMs,
                });
                report.deleted_order = cleanupResult.response.ok || report.deleted_order;
            } catch (cleanupError) {
                recordStep('cleanup_delete_order', {
                    ok: false,
                    error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
                });
            }
        }

        if (prisma) {
            await prisma.$disconnect().catch(() => null);
        }
        if (page) {
            await page.close().catch(() => null);
        }
        if (context) {
            await context.close().catch(() => null);
        }
        if (browser) {
            await browser.close().catch(() => null);
        }
    }

    const outputPath = path.join(process.cwd(), 'reports', `prod-smoke-${runId}.json`);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    console.log(JSON.stringify({ ok: report.success, output_path: outputPath, report }, null, 2));
    if (!report.success) {
        process.exitCode = 1;
    }
}

run().catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
});
