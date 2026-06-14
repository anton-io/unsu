/**
 * ASTA Design System JavaScript
 * Minimal interactive components
 * Based on https://anton.io/asta
 */

(function() {
    'use strict';

    const Asta = {
        version: '1.0.0',

        /**
         * Initialize all Asta components
         */
        init: function() {
            this.initModals();
            this.initDetails();
            this.initForms();
            console.log(`[Asta] Design system initialized v${this.version}`);
        },

        /**
         * Modal Management
         */
        modals: {
            active: null,

            open: function(modalId) {
                const modal = document.getElementById(modalId);
                if (!modal) {
                    console.warn(`[Asta] Modal "${modalId}" not found`);
                    return;
                }

                // Close any active modal first
                if (Asta.modals.active) {
                    Asta.modals.close(Asta.modals.active);
                }

                modal.classList.add('active');
                Asta.modals.active = modalId;

                // Add fade-in animation
                modal.classList.add('asta-fade-in');

                // Lock body scroll
                document.body.style.overflow = 'hidden';

                // Emit event
                modal.dispatchEvent(new CustomEvent('asta:modal:opened', {
                    detail: { modalId }
                }));
            },

            close: function(modalId) {
                const modal = modalId
                    ? document.getElementById(modalId)
                    : document.getElementById(Asta.modals.active);

                if (!modal) return;

                modal.classList.remove('active');

                if (Asta.modals.active === (modalId || Asta.modals.active)) {
                    Asta.modals.active = null;
                }

                // Unlock body scroll
                document.body.style.overflow = '';

                // Emit event
                modal.dispatchEvent(new CustomEvent('asta:modal:closed', {
                    detail: { modalId: modal.id }
                }));
            },

            closeAll: function() {
                document.querySelectorAll('.asta-modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
                Asta.modals.active = null;
                document.body.style.overflow = '';
            }
        },

        /**
         * Initialize modal functionality
         */
        initModals: function() {
            // Close modal on background click
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('asta-modal')) {
                    Asta.modals.close(e.target.id);
                }
            });

            // Close modal on close button click
            document.querySelectorAll('.asta-modal-close').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const modal = e.target.closest('.asta-modal');
                    if (modal) {
                        Asta.modals.close(modal.id);
                    }
                });
            });

            // Close modal on ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && Asta.modals.active) {
                    Asta.modals.close();
                }
            });

            // Add data-modal triggers
            document.querySelectorAll('[data-asta-modal]').forEach(trigger => {
                trigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    const modalId = this.getAttribute('data-asta-modal');
                    Asta.modals.open(modalId);
                });
            });
        },

        /**
         * Initialize details/summary collapsibles
         */
        initDetails: function() {
            document.querySelectorAll('details').forEach(details => {
                details.addEventListener('toggle', function() {
                    const event = new CustomEvent('asta:details:toggle', {
                        detail: {
                            open: this.open,
                            element: this
                        }
                    });
                    this.dispatchEvent(event);
                });
            });
        },

        /**
         * Form validation and enhancement
         */
        forms: {
            validate: function(formElement) {
                const inputs = formElement.querySelectorAll('input, textarea, select');
                let isValid = true;

                inputs.forEach(input => {
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        isValid = false;
                        input.classList.add('asta-error');
                    } else {
                        input.classList.remove('asta-error');
                    }
                });

                return isValid;
            },

            reset: function(formElement) {
                formElement.reset();
                formElement.querySelectorAll('.asta-error').forEach(el => {
                    el.classList.remove('asta-error');
                });
            }
        },

        /**
         * Initialize form enhancements
         */
        initForms: function() {
            // Auto-clear error state on input
            document.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('input', function() {
                    this.classList.remove('asta-error');
                });
            });

            // Handle form validation
            document.querySelectorAll('form[data-asta-validate]').forEach(form => {
                form.addEventListener('submit', function(e) {
                    if (!Asta.forms.validate(this)) {
                        e.preventDefault();
                        console.warn('[Asta] Form validation failed');
                    }
                });
            });
        },

        /**
         * Toast notifications
         */
        toast: {
            show: function(message, type = 'info', duration = 3000) {
                const toast = document.createElement('div');
                toast.className = `asta-message ${type} asta-fade-in`;
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                `;

                document.body.appendChild(toast);

                // Auto-remove after duration
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, duration);

                return toast;
            },

            success: function(message, duration) {
                return this.show(message, 'success', duration);
            },

            error: function(message, duration) {
                return this.show(message, 'error', duration);
            },

            warning: function(message, duration) {
                return this.show(message, 'warning', duration);
            }
        },

        /**
         * Utility: Smooth scroll to element
         */
        scrollTo: function(elementOrSelector, offset = 0) {
            const element = typeof elementOrSelector === 'string'
                ? document.querySelector(elementOrSelector)
                : elementOrSelector;

            if (!element) return;

            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        },

        /**
         * Utility: Debounce function
         */
        debounce: function(func, wait = 300) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Utility: Create element with attributes
         */
        createElement: function(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);

            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'dataset') {
                    Object.keys(attributes[key]).forEach(dataKey => {
                        element.dataset[dataKey] = attributes[key][dataKey];
                    });
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });

            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });

            return element;
        },

        /**
         * Create a modal programmatically
         */
        createModal: function(options) {
            const {
                id,
                title,
                body,
                footer,
                type = '', // 'error', 'success', 'warning'
                onClose
            } = options;

            const modal = this.createElement('div', {
                id: id,
                className: `asta-modal ${type}`
            });

            const content = this.createElement('div', {
                className: 'asta-modal-content'
            });

            // Header
            const header = this.createElement('div', {
                className: 'asta-modal-header'
            }, [
                this.createElement('h3', {
                    className: 'asta-modal-title'
                }, [title]),
                this.createElement('button', {
                    className: 'asta-modal-close'
                }, ['×'])
            ]);

            // Body
            const bodyEl = this.createElement('div', {
                className: 'asta-modal-body'
            });
            if (typeof body === 'string') {
                bodyEl.innerHTML = body;
            } else {
                bodyEl.appendChild(body);
            }

            content.appendChild(header);
            content.appendChild(bodyEl);

            // Footer (optional)
            if (footer) {
                const footerEl = this.createElement('div', {
                    className: 'asta-modal-footer'
                });
                if (typeof footer === 'string') {
                    footerEl.innerHTML = footer;
                } else if (Array.isArray(footer)) {
                    footer.forEach(btn => footerEl.appendChild(btn));
                } else {
                    footerEl.appendChild(footer);
                }
                content.appendChild(footerEl);
            }

            modal.appendChild(content);
            document.body.appendChild(modal);

            // Add close handler
            if (onClose) {
                modal.addEventListener('asta:modal:closed', onClose);
            }

            // Initialize modal functionality for new modal
            const closeBtn = modal.querySelector('.asta-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.modals.close(id);
                });
            }

            return modal;
        },

        /**
         * Confirm dialog (returns Promise)
         */
        confirm: function(message, title = 'Confirm') {
            return new Promise((resolve) => {
                const confirmBtn = this.createElement('button', {
                    className: 'btn-danger'
                }, ['Confirm']);

                const cancelBtn = this.createElement('button', {
                    className: 'btn-secondary'
                }, ['Cancel']);

                const modalId = `asta-confirm-${Date.now()}`;

                confirmBtn.addEventListener('click', () => {
                    this.modals.close(modalId);
                    resolve(true);
                });

                cancelBtn.addEventListener('click', () => {
                    this.modals.close(modalId);
                    resolve(false);
                });

                const body = this.createElement('p', {}, [message]);

                this.createModal({
                    id: modalId,
                    title: title,
                    body: body,
                    footer: [confirmBtn, cancelBtn],
                    type: 'warning'
                });

                this.modals.open(modalId);
            });
        }
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Asta.init());
    } else {
        Asta.init();
    }

    // Export to window
    window.Asta = Asta;

})();
