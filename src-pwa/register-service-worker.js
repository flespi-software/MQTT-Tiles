/*
 * This file is picked up by the build system only
 * when building for PRODUCTION
 */

import { register } from 'register-service-worker'

register(process.env.SERVICE_WORKER_FILE, {
  ready () {
    console.log('App is being served from cache by a service worker.')
  },
  registered (registration) { // registration -> a ServiceWorkerRegistration instance
    console.log('Service worker has been registered.')
  },
  cached (registration) { // registration -> a ServiceWorkerRegistration instance
    console.log('Content has been cached for offline use.')
  },
  updatefound (registration) { // registration -> a ServiceWorkerRegistration instance
    console.log('New content is downloading.')
  },
  updated (registration) { // registration -> a ServiceWorkerRegistration instance
    let notification = document.createElement('div')
    notification.id = 'sw-notification'
    notification.innerHTML = `<div class="q-notification-list q-notification-list-bottom fixed-bottom column items-end z-top">
                                              <div class="q-notification">
                                                <div class="q-alert row no-wrap shadow-2 bg-amber-9 text-white">
                                                  <div class="q-alert-side col-auto row flex-center q-px-md">
                                                    <i aria-hidden="true" class="q-icon material-icons" style="font-size: 35px;">warning</i>
                                                  </div>
                                                  <div class="q-alert-content col self-center">
                                                    <div>The new version of MQQT Tiles is available. Refresh the page to update?</div>
                                                  </div>
                                                  <div class="q-alert-actions col-auto gutter-xs column flex-center q-pa-md">
                                                    <div class="full-width">
                                                      <button tabindex="0" class="q-btn inline relative-position q-btn-item non-selectable full-width q-btn-rectangle q-btn-flat q-focusable q-hoverable q-btn-dense">
                                                        <div class="q-focus-helper"></div>
                                                        <div class="q-btn-inner row col items-center justify-start">
                                                          <div>Agree</div>
                                                        </div>
                                                      </button>
                                                    </div>
                                                    <div class="full-width">
                                                      <button tabindex="0" class="q-btn inline relative-position q-btn-item non-selectable full-width q-btn-rectangle q-btn-flat q-focusable q-hoverable q-btn-dense">
                                                        <div class="q-focus-helper"></div>
                                                        <div class="q-btn-inner row col items-center justify-start">
                                                          <div>Abort</div>
                                                        </div>
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>`
    let buttons = notification.getElementsByTagName('button'),
      body = document.getElementsByTagName('body')[0]
    function reload () {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            reg.unregister().then(() => { window.location.reload(true) })
          } else {
            window.location.reload(true)
          }
        })
      } else {
        window.location.reload(true)
      }
      setTimeout(() => { window.location.reload(true) }, 1000)
    }
    buttons[0].addEventListener('click', (ev) => { reload() })
    buttons[1].addEventListener('click', (ev) => { notification.remove() })
    body.appendChild(notification)
  },
  offline () {
    console.log('No internet connection found. App is running in offline mode.')
  },
  error (err) {
    console.error('Error during service worker registration:', err)
  }
})

// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
