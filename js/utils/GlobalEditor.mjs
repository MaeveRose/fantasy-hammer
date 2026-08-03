export class GlobalJsonEditor {

  /**
   * Initializes real-time highlighting, tab tracking, line counting, and blur submission on a target element.
   * Call this inside any AppV2 sheet's _onRender method.
   * @param {HTMLElement} sheetElement - The root element of the sheet application (this.element)
   * @param {ApplicationV2} sheetInstance - The instance of the application sheet class (this)
   * @param {string} selector - The CSS class selector for the code element
   */
  static attach(sheetElement, sheetInstance, selector = "code.code-highlight-enabled") {
    const codeElement = sheetElement.querySelector(selector);
    if (!codeElement) return;

    // A. The Text Tokenizer Engine
    const runHighlight = () => {
      const text = codeElement.textContent;
      let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const highlightedHtml = safeText.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = 'token-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'token-key';
              if (match.includes('|')) {
                const isTrailingColon = match.endsWith(':');
                let keyContent = isTrailingColon ? match.slice(0, -1) : match;
                const coloredKey = keyContent.split('|').join('<span class="token-pipe">|</span>');
                return `<span class="${cls}">${coloredKey}</span>${isTrailingColon ? ':' : ''}`;
              }
            } else {
              cls = 'token-string';
            }
          } else if (/true|false|null/.test(match)) {
            cls = 'token-bool';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );

      const linesArray = highlightedHtml.split('\n');
      const structuredHtml = linesArray.map(line => {
        return `<div class="editor-line-row">${line === "" ? " " : line}</div>`;
      }).join('');

      const selection = window.getSelection();
      let caretOffset = 0;
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(codeElement);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }

      codeElement.innerHTML = structuredHtml;

      if (caretOffset > 0) {
        let currentOffset = 0;
        const range = document.createRange();
        const sel = window.getSelection();

        const traverseNodes = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (currentOffset + node.length >= caretOffset) {
              range.setStart(node, caretOffset - currentOffset);
              range.collapse(true);
              return true;
            }
            currentOffset += node.length;
          } else {
            for (let i = 0; i < node.childNodes.length; i++) {
              if (traverseNodes(node.childNodes[i])) return true;
            }
          }
          return false;
        };

        traverseNodes(codeElement);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    // Initialize formatting immediately on display draw
    runHighlight();

    // Clear validation borders on focus/typing
    codeElement.addEventListener('focus', () => {
      codeElement.closest('.code-editor-container')?.style.setProperty("border-color", "");
    });

    codeElement.addEventListener('input', () => {
      codeElement.closest('.code-editor-container')?.style.setProperty("border-color", "");
      runHighlight();
    });

    // B. Handle Auto-Save on Blur (Clicking Away)
    codeElement.addEventListener('blur', async () => {
      const userTypedText = codeElement.textContent ? codeElement.textContent.trim() : "";

      // Strict syntax text validation check
      if (!foundry.data.validators.isJSON(userTypedText)) {
        ui.notifications.error("Failed to Save: Invalid JSON syntax.");
        const container = codeElement.closest('.code-editor-container');
        if (container) container.style.borderColor = "var(--color-shadow-error, #ff0000)";
        return;
      }

      // Update the hidden input field that Foundry tracks natively
      const dataPath = codeElement.dataset.name;
      const container = codeElement.closest('.code-editor-container');
      const hiddenInput = container?.querySelector(`input[type="hidden"]`);

      if (hiddenInput && dataPath) {
        hiddenInput.value = userTypedText;
        // Dispatch change so the Form Application hooks notice the interaction
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // C. Indentation Handling for the Tab Key
    codeElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const tabNode = document.createTextNode("  ");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        sel.removeAllRanges();
        sel.addRange(range);
        runHighlight();
      }
    });
  }

  /**
   * Processes the contenteditable text layer back into a database JSON payload.
   * Call this inside any AppV2 sheet's _processSubmitData method.
   * @param {HTMLFormElement} form - The current sub-form scope instance context
   * @param {object} formData - The processing system target output object matrix
   * @param {string} dataPath - The absolute key path inside system schema rules (e.g. "system.customJSON")
   * @param {string} selector - CSS class lookup rule for the targeting node
   */
  static processSubmit(form, formData) {
    const editors = form.querySelectorAll("code.code-highlight-enabled");

    for (const codeElement of editors) {
      const dataPath = codeElement.dataset.name; // e.g., "system.customJSON"
      const container = codeElement.closest('.code-editor-container');
      const hiddenInput = container?.querySelector(`input[type="hidden"][name="${dataPath}"]`);
      //console.log(hiddenInput);
      if (!hiddenInput || !dataPath) continue;

      const rawText = hiddenInput.value.trim();

      // 1. FIXED SAFEGUARD: Read the raw text directly from the active code block.
      // If the text inside the contenteditable block matches the exact object 
      // already stored in the database document, it means the user DID NOT edit the JSON.
      // We skip the validation entirely so it can NEVER overwrite or wipe your data!
      const currentDbValue = codeElement.textContent ? codeElement.textContent.trim() : "";

      // If the form update payload doesn't explicitly name our path and the user hasn't 
      // explicitly interacted with the editor text area, drop out of the execution loop.
      if (!form.querySelector(`input[name="${dataPath}"]`)) {
        continue;
      }

      // 2. Only handle empty clear commands if the field itself was explicitly edited to be empty
      if (rawText === "") {
        // Double-check if the element has focus or was part of the change target loop
        if (document.activeElement === codeElement || hiddenInput.dataset.dirty === "true") {
          foundry.utils.setProperty(formData, dataPath, {});
        } else {
          // If it's an auto-save from an armor block, protect the key from being merged
          delete formData[dataPath];
          if (formData.system) delete formData.system[dataPath.split('.')[1]];
        }
        continue;
      }

      // 3. Run strict V13 validation check only on active data mutations
      if (foundry.data.validators.isJSON(rawText)) {
        foundry.utils.setProperty(formData, dataPath, JSON.parse(rawText));
      } else {
        throw new Error(`Aborting sheet save: Malformed JSON tracking payload at path [${dataPath}]`);
      }
    }
  }
  static async onSaveAction(event, target) {
    event.preventDefault();
    event.stopPropagation();

    // 1. NATIVE V13 BINDING: Because Foundry binds actions automatically,
    // "this" points straight to the instanced sheet class.
    const documentInstance = this.document;
    if (!documentInstance) {
      console.error("GlobalJsonEditor | Could not find document reference on 'this'.");
      ui.notifications.error("Failed to Save: Internal sheet context missing.");
      return;
    }

    // 2. Find the local container wrapping this specific clicked button
    const container = target.closest('.code-editor-container');
    const codeElement = container?.querySelector('code.code-highlight-enabled');
    if (!codeElement) {
      console.error("GlobalJsonEditor | Could not locate code block node in DOM.");
      return;
    }

    const userTypedText = codeElement.textContent ? codeElement.textContent.trim() : "";

    // 3. Strict syntax check validation
    if (!foundry.data.validators.isJSON(userTypedText) && userTypedText !== "") {
      ui.notifications.error("Failed to Save: Invalid JSON syntax in editor.");
      container.style.borderColor = "var(--color-shadow-error, #ff0000)";
      return;
    }

    // Clear error highlights on success
    container.style.borderColor = "";

    // 4. Extract the target data model path dynamically (e.g., "system.customJSON")
    const dataPath = codeElement.dataset.name;
    if (!dataPath) return;

    // Default to an empty object if they cleared the field entirely
    const cleanJsonObject = userTypedText === "" ? {} : JSON.parse(userTypedText);

    // 5. THE FORCE SAVE: Write straight to the document data layer.
    try {
      ui.notifications.info("Saving JSON configuration...");

      // Updates the DB directly, completely bypassing form parsing and tab layouts!
      await documentInstance.update({ [dataPath]: cleanJsonObject });

      //ui.notifications.active.find(n => n.text?.includes("Saving JSON"))?.remove();
      ui.notifications.info("Configuration saved successfully!");
    } catch (err) {
      console.error("GlobalJsonEditor | Database Update Failed:", err);
      ui.notifications.error("Database rejected the save operation.");
    }
  }
}

window.GlobalJsonEditor = GlobalJsonEditor;