import { Controller } from "@hotwired/stimulus"
import axios from 'axios'

export default class extends Controller {
  static targets = ["area"]

  connect() {
    this.setupAxiosCSRF();
    this.canvassId = document.getElementById("canvass-container").dataset.canvassId;

    this.loadContents();

    this.areaTarget.addEventListener('dblclick', event => {
      if (event.target.classList.contains('content')) {
        event.target.remove();
      }
    });
  }

  loadContents() {
    axios.get(`/canvasses/${this.canvassId}/contents`)
      .then(response => {
        this.displayContents(response.data.contents);
      })
      .catch(error => console.error('Error fetching contents:', error));
  }

  displayContents(contents) {
    const area = document.getElementById("contentArea");

    contents.forEach(content => {
      const div = document.createElement('div');
      div.setAttribute('data-content-id', content.id);

      // Check if styles exist and are not null
      if (content.styles && typeof content.styles === 'object') {
        // Set styles with fallbacks in case any property is missing
        div.style.position = 'absolute';
        div.style.left = content.styles.left || '0px';
        div.style.top = content.styles.top || '0px';
        div.style.width = content.styles.width || '100px';
        div.style.height = content.styles.height || '100px';
        div.style.backgroundColor = content.styles.color || 'grey'; // Default to grey if no color specified
      } else {
        // Default styles if no styles provided
        div.style.position = 'absolute';
        div.style.left = '0px';
        div.style.top = '0px';
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.backgroundColor = 'grey';
      }

      area.appendChild(div);
      this.initializeDragAndResize(div);
    });
  }

  async addContent() {
    const content = document.createElement('div');
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    content.className = 'content';
    content.style.backgroundColor = color;
    content.style.width = '100px';
    content.style.height = '100px';
    content.style.position = 'absolute';
    content.style.left = '200px';
    content.style.top = '200px';
    content.style.border = `3px solid ${color}`;

    try {
      const response = await this.saveContent(content);
      if (response && response.success) {
        content.dataset.contentId = response.content.id;
        this.areaTarget.appendChild(content);
        this.initializeDragAndResize(content);
      } else {
        console.error('Failed to save content.');
      }
    } catch (error) {
      console.error('Error during content creation:', error);
    }
  }

  initializeDragAndResize(content) {
    let startX, startY, mode, offsetX, offsetY;

    content.addEventListener('mousedown', e => {
      const contentStart = content.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      mode = content.style.cursor.includes('resize') ? 'resizing' : 'dragging';
      offsetX = startX - contentStart.left;
      offsetY = startY - contentStart.top;

      const onMouseMove = e => {
        if (mode === 'dragging') {
          content.style.left = `${e.clientX - offsetX}px`;
          content.style.top = `${e.clientY - offsetY}px`;
        } else if (mode === 'resizing') {
          this.resizeContent(content, e, startX, startY, contentStart);
        }

        clearTimeout(this.timeout);  // Clear any existing timeout
        this.timeout = setTimeout(() => this.saveContent(content), 2000);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        content.style.cursor = 'move';
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.saveContent(content), 2000);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    this.updateCursorOnHover(content);
  }

  resizeContent(content, e, startX, startY, contentStart) {
    if (content.style.cursor.includes('n') || content.style.cursor.includes('s')) {
      content.style.height = `${Math.max(50, contentStart.height + (e.clientY - startY))}px`;
    }
    if (content.style.cursor.includes('e') || content.style.cursor.includes('w')) {
      content.style.width = `${Math.max(50, contentStart.width + (e.clientX - startX))}px`;
    }
  }

  updateCursorOnHover(content) {
    content.addEventListener('mousemove', e => {
      const resizeBuffer = 7;  // Sensitivity area for resizing
      const contentBounds = content.getBoundingClientRect();

      if (e.clientX > contentBounds.right - resizeBuffer && e.clientY < contentBounds.bottom - resizeBuffer && e.clientY > contentBounds.top + resizeBuffer) {
        content.style.cursor = 'e-resize';
      } else if (e.clientY > contentBounds.bottom - resizeBuffer && e.clientX < contentBounds.right - resizeBuffer && e.clientX > contentBounds.left + resizeBuffer) {
        content.style.cursor = 's-resize';
      } else if (e.clientX < contentBounds.left + resizeBuffer && e.clientY < contentBounds.bottom - resizeBuffer && e.clientY > contentBounds.top + resizeBuffer) {
        content.style.cursor = 'w-resize';
      } else if (e.clientY < contentBounds.top + resizeBuffer && e.clientX < contentBounds.right - resizeBuffer && e.clientX > contentBounds.left + resizeBuffer) {
        content.style.cursor = 'n-resize';
      } else {
        content.style.cursor = 'move';
      }
    });
  }

  async saveContent(content) {
    const contentId = content.dataset.contentId
    const url = contentId ? `/contents/${contentId}` : '/contents';
    const method = contentId ? 'patch' : 'post';

    const contentData = {
      canvass_id: this.canvassId,
      styles: {
        color: content.style.backgroundColor,
        width: content.style.width,
        height: content.style.height,
        top: content.style.top,
        left: content.style.left
      }
    };

    try {
      const response = await axios({ method: method, url: url, data: { content: contentData } });
      return response.data;
    } catch (error) {
      console.error('Error saving content:', error);
      return null;
    }
  }

  clearCanvass() {
    axios.post(`/canvasses/${this.canvassId}/clear`)
      .then(response => {
        console.log('Canvas cleared:', response.data.message);
        this.areaTarget.innerHTML = ''; // Clear the canvas only after confirmation from the server
      })
      .catch(error => {
        console.error('Error clearing canvas:', error);
      });
  }

  setupAxiosCSRF() {
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
    axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
  }
}
