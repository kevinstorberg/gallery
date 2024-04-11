import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["area"]

  connect() {
    this.areaTarget.addEventListener('dblclick', event => {
      if (event.target.classList.contains('rectangle')) {
        event.target.remove();
      }
    });
  }

  addContent() {
    const rect = document.createElement('div');
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    rect.className = 'rectangle';
    rect.style.backgroundColor = color;
    rect.style.width = '100px';
    rect.style.height = '100px';
    rect.style.position = 'absolute';
    rect.style.left = '200px';
    rect.style.top = '200px';
    rect.style.border = `3px solid ${color}`;
    this.areaTarget.appendChild(rect);
    this.initializeDragAndResize(rect);
  }

  initializeDragAndResize(rect) {
    rect.addEventListener('mousedown', e => {
      const rectStart = rect.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      let mode = '';

      // Determine mode based on cursor type
      if (rect.style.cursor.includes('resize')) {
        mode = 'resizing';
      } else {
        mode = 'dragging';
        var offsetX = startX - rectStart.left;
        var offsetY = startY - rectStart.top;
      }

      const onMouseMove = e => {
        if (mode === 'dragging') {
          rect.style.left = `${e.clientX - offsetX}px`;
          rect.style.top = `${e.clientY - offsetY}px`;
        } else if (mode === 'resizing') {
          if (rect.style.cursor.includes('n') || rect.style.cursor.includes('s')) {
            rect.style.height = `${Math.max(50, rectStart.height + e.clientY - startY)}px`;
          }

          if (rect.style.cursor.includes('e') || rect.style.cursor.includes('w')) {
            rect.style.width = `${Math.max(50, rectStart.width + e.clientX - startX)}px`;
          }
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        rect.style.cursor = 'move';  // Reset cursor
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      e.preventDefault();  // Prevent default drag and drop and text selection behavior
    });

    // Update cursor on mouse over the borders
    rect.addEventListener('mousemove', e => {
      const resizeBuffer = 7;  // Sensitivity area for resizing
      const rectBounds = rect.getBoundingClientRect();

      // Check if the cursor is near the right edge for east resizing
      if (e.clientX > rectBounds.right - resizeBuffer && e.clientY < rectBounds.bottom - resizeBuffer && e.clientY > rectBounds.top + resizeBuffer) {
          rect.style.cursor = 'e-resize';
      }
      // Check if the cursor is near the bottom edge for south resizing
      else if (e.clientY > rectBounds.bottom - resizeBuffer && e.clientX < rectBounds.right - resizeBuffer && e.clientX > rectBounds.left + resizeBuffer) {
          rect.style.cursor = 's-resize';
      }
      // Check if the cursor is near the left edge for west resizing
      else if (e.clientX < rectBounds.left + resizeBuffer && e.clientY < rectBounds.bottom - resizeBuffer && e.clientY > rectBounds.top + resizeBuffer) {
          rect.style.cursor = 'w-resize';
      }
      // Check if the cursor is near the top edge for north resizing
      else if (e.clientY < rectBounds.top + resizeBuffer && e.clientX < rectBounds.right - resizeBuffer && e.clientX > rectBounds.left + resizeBuffer) {
          rect.style.cursor = 'n-resize';
      }
      // Set cursor to move if not near any edges
      else {
          rect.style.cursor = 'move';
      }
    });
  }

  clearCanvass() {
    this.areaTarget.innerHTML = '';
  }
}
