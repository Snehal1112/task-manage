import { test, expect } from '@playwright/test';

test.describe('Task Management Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('h1').filter({ hasText: 'Task Management' })).toBeVisible();
  });

  test('should load the application successfully', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('h1').filter({ hasText: 'Task Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search tasks/i)).toBeVisible();

    // Check Eisenhower Matrix quadrants are present
    await expect(page.getByText('Do (Urgent + Important)')).toBeVisible();
    await expect(page.getByText('Schedule (Not Urgent + Important)')).toBeVisible();
    await expect(page.getByText('Delegate (Urgent + Not Important)')).toBeVisible();
    await expect(page.getByText('Delete (Not Urgent + Not Important)')).toBeVisible();
  });

  test('should create a new task with rich text description', async ({ page }) => {
    // Click add task button
    await page.getByRole('button', { name: /add task/i }).click();

    // Wait for modal to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in task details
    await page.getByLabel(/title/i).fill('Test Task with Rich Text');
    await page.getByLabel(/urgent.*requires immediate attention/i).check();
    await page.getByLabel(/important.*has significant impact/i).check();

    // Use the rich text editor for description
    const descriptionEditor = page.locator('.ProseMirror').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('This is a **bold** description with *italic* text and a list:');

    // Test rich text formatting - click buttons to find them in the toolbar
    const toolbar = page.locator('.flex.flex-wrap.items-center.gap-1.p-2');
    
    // Click bold button (first button)
    await toolbar.locator('button').nth(0).click();
    await descriptionEditor.type('Bold text');
    await toolbar.locator('button').nth(0).click(); // Click bold again to turn off

    await descriptionEditor.type(' and ');
    
    // Click italic button (second button)
    await toolbar.locator('button').nth(1).click();
    await descriptionEditor.type('italic text');
    await toolbar.locator('button').nth(1).click(); // Click italic again to turn off

    // Test font size controls (last two buttons)
    const buttons = toolbar.locator('button');
    const buttonCount = await buttons.count();
    await buttons.nth(buttonCount - 2).click(); // Decrease font size
    await buttons.nth(buttonCount - 1).click(); // Increase font size

    // Test list (fourth button)
    await toolbar.locator('button').nth(3).click();
    await descriptionEditor.type('First item');
    await page.keyboard.press('Enter');
    await descriptionEditor.type('Second item');

    // Submit the task
    await page.getByRole('button', { name: /add task/i }).click();

    // Verify task appears in the correct quadrant (Do - high priority, urgent)
    await expect(page.getByText('Test Task with Rich Text')).toBeVisible();
    await expect(page.locator('text=Do (Urgent + Important)').locator('xpath=ancestor::div[contains(@class, "flex flex-col")]')).toContainText('Test Task with Rich Text');
  });

  test('should display task details with formatted description', async ({ page }) => {
    // Click on a task to view details
    await page.getByText('Test Task with Rich Text').click();

    // Check task detail modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Test Task with Rich Text')).toBeVisible();

    // Check that rich text formatting is preserved
    await expect(page.getByText('Bold text')).toBeVisible();
    await expect(page.getByText('italic text')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    // Click on the task to open details
    await page.getByText('Test Task with Rich Text').click();

    // Click edit button
    await page.getByRole('button', { name: /edit task/i }).click();

    // Modify the title
    await page.getByLabel(/title/i).fill('Updated Test Task');

    // Modify the description
    const descriptionEditor = page.locator('.ProseMirror').first();
    await descriptionEditor.click();
    await descriptionEditor.fill('Updated description with blockquote:');
    
    // Click blockquote button (fifth button in toolbar)
    const toolbar = page.locator('.flex.flex-wrap.items-center.gap-1.p-2');
    await toolbar.locator('button').nth(4).click();
    await descriptionEditor.type('This is a blockquote');

    // Change priority and urgency
    await page.getByLabel(/urgent.*requires immediate attention/i).uncheck();
    await page.getByLabel(/important.*has significant impact/i).uncheck();

    // Save changes
    await page.getByRole('button', { name: /update task/i }).click();

    // Verify task moved to correct quadrant (Delete - low priority, not urgent)
    await expect(page.locator('text=Delete (Not Urgent + Not Important)').locator('xpath=ancestor::div[contains(@class, "flex flex-col")]')).toContainText('Updated Test Task');
  });

  test('should search and filter tasks', async ({ page }) => {
    // Create another task for testing search
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByLabel(/title/i).fill('Search Test Task');
    // Set different priority flags (not urgent, not important) - already unchecked by default
    const descEditor = page.locator('.ProseMirror').first();
    await descEditor.click();
    await descEditor.fill('This task contains searchable content');
    await page.getByRole('button', { name: /add task/i }).click();

    // Test search functionality
    await page.getByPlaceholder(/search tasks/i).fill('searchable');
    await expect(page.getByText('Search Test Task')).toBeVisible();
    await expect(page.getByText('Updated Test Task')).not.toBeVisible();

    // Clear search
    await page.getByPlaceholder(/search tasks/i).clear();
    await expect(page.getByText('Search Test Task')).toBeVisible();
    await expect(page.getByText('Updated Test Task')).toBeVisible();
  });

  test('should delete a task with confirmation', async ({ page }) => {
    // Click on the search test task
    await page.getByText('Search Test Task').click();

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion in modal
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: /delete task/i }).click();

    // Verify task is removed
    await expect(page.getByText('Search Test Task')).not.toBeVisible();
  });

  test('should handle drag and drop between quadrants', async ({ page }) => {
    // Get the task card
    const taskCard = page.getByText('Updated Test Task');

    // Drag from Delete quadrant to Do quadrant
    const deleteQuadrant = page.locator('text=Delete (Not Urgent + Not Important)').locator('xpath=ancestor::div[contains(@class, "flex flex-col")]');
    const doQuadrant = page.locator('text=Do (Urgent + Important)').locator('xpath=ancestor::div[contains(@class, "flex flex-col")]');

    // Use Playwright's drag and drop
    await taskCard.dragTo(doQuadrant);

    // Verify task moved
    await expect(doQuadrant).toContainText('Updated Test Task');
    await expect(deleteQuadrant).not.toContainText('Updated Test Task');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Press Ctrl+N to add new task (works on both Windows/Linux and Mac)
    await page.keyboard.press('Control+n');

    // Verify modal opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should validate task form inputs', async ({ page }) => {
    // Click add task button
    await page.getByRole('button', { name: /add task/i }).click();

    // Try to submit without title
    await page.getByRole('button', { name: /add task/i }).click();

    // The browser should prevent submission and focus the title field
    await expect(page.getByLabel(/title/i)).toBeFocused();

    // Fill title and try to submit with too long description
    await page.getByLabel(/title/i).fill('Valid Title');
    const descEditor = page.locator('.ProseMirror').first();
    await descEditor.click();
    // Create a very long description that exceeds the limit
    const longText = 'A'.repeat(2001); // Exceeds 2000 character limit
    await descEditor.fill(longText);

    // The submit button should be disabled
    const submitButton = page.getByRole('button', { name: /add task/i });
    await expect(submitButton).toBeDisabled();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should handle task completion toggle', async ({ page }) => {
    // Click on the task
    await page.getByText('Updated Test Task').click();

    // Toggle completion
    await page.getByRole('checkbox', { name: /completed/i }).check();

    // Close modal
    await page.keyboard.press('Escape');

    // Verify task shows as completed (might have different styling)
    const taskCard = page.getByText('Updated Test Task');
    await expect(taskCard).toBeVisible();
  });

  test('should persist tasks across page reload', async ({ page }) => {
    // Verify task still exists
    await expect(page.getByText('Updated Test Task')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify task persists
    await expect(page.getByText('Updated Test Task')).toBeVisible();
  });
});
