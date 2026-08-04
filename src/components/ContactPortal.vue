<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { api } from '@/api/client'
import { DISCIPLINE_IDS } from '@/stores/services'
import type { ContactPayload, ContactReceipt, Locale } from '@/types'

const { t, locale } = useI18n()

const form = reactive<ContactPayload>({
  name: '',
  email: '',
  organisation: '',
  discipline: 'general',
  message: '',
})

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const receiptEl = ref<HTMLElement | null>(null)

const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorMessage = ref('')
const receipt = ref<ContactReceipt | null>(null)

async function send() {
  status.value = 'sending'
  errorMessage.value = ''

  try {
    receipt.value = await api.contact({ ...form, locale: locale.value as Locale })
    status.value = 'sent'
    await revealReceipt()
  } catch (cause) {
    errorMessage.value = cause instanceof Error ? cause.message : 'Something went wrong.'
    status.value = 'error'
  }
}

/**
 * The receipt is far shorter than the form it replaces, so the page collapses
 * underneath the reader and leaves them looking at the footer. Bring the
 * receipt back into view and hand it the focus so it is also announced.
 */
async function revealReceipt() {
  await nextTick()
  const element = receiptEl.value
  if (!element) return

  element.focus({ preventScroll: true })
  element.scrollIntoView({
    behavior: reducedMotion.value ? 'auto' : 'smooth',
    block: 'center',
  })
}

function reset() {
  Object.assign(form, { name: '', email: '', organisation: '', discipline: 'general', message: '' })
  receipt.value = null
  status.value = 'idle'
}
</script>

<template>
  <section id="contact" class="contact">
    <div class="shell contact__inner">
      <div class="contact__intro">
        <p class="eyebrow contact__eyebrow">{{ t('contact.eyebrow') }}</p>
        <h2 class="contact__title">{{ t('contact.title') }}</h2>
        <p class="contact__lead">{{ t('contact.lead') }}</p>

        <dl class="offices">
          <div><dt>{{ t('contact.americas') }}</dt><dd class="mono">+1 402 399 1000</dd></div>
          <div><dt>{{ t('contact.apac') }}</dt><dd class="mono">+61 2 8081 4600</dd></div>
          <div><dt>{{ t('contact.europe') }}</dt><dd class="mono">+44 20 7451 3200</dd></div>
        </dl>
      </div>

      <div class="card">
        <div
          v-if="status === 'sent' && receipt"
          ref="receiptEl"
          class="receipt"
          role="status"
          tabindex="-1"
        >
          <p class="receipt__badge mono">{{ t('contact.received') }}</p>
          <p class="receipt__reference mono">{{ receipt.reference }}</p>
          <p class="receipt__copy">
            {{ t('contact.routed', { office: receipt.office, date: receipt.respondBy }) }}
          </p>
          <button class="ghost" type="button" @click="reset">{{ t('contact.another') }}</button>
        </div>

        <form v-else class="form" novalidate @submit.prevent="send">
          <div class="field">
            <label for="name">{{ t('contact.name') }}</label>
            <input id="name" v-model="form.name" type="text" autocomplete="name" required />
          </div>

          <div class="field">
            <label for="email">{{ t('contact.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="name@company.com"
              required
            />
          </div>

          <div class="field">
            <label for="organisation">{{ t('contact.organisation') }}</label>
            <input id="organisation" v-model="form.organisation" type="text" autocomplete="organization" />
          </div>

          <div class="field">
            <label for="discipline">{{ t('contact.discipline') }}</label>
            <select id="discipline" v-model="form.discipline">
              <option value="general">{{ t('contact.general') }}</option>
              <option v-for="id in DISCIPLINE_IDS" :key="id" :value="id">
                {{ t(`directory.filters.${id}`) }}
              </option>
            </select>
          </div>

          <div class="field field--wide">
            <label for="message">{{ t('contact.message') }}</label>
            <textarea id="message" v-model="form.message" rows="4" required></textarea>
          </div>

          <p v-if="status === 'error'" class="error" role="alert">{{ errorMessage }}</p>

          <button class="submit" type="submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? t('contact.sending') : t('contact.submit') }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: var(--navy-900);
  color: #fff;
  padding-block: clamp(3rem, 8vw, 5.5rem);
}

.contact__inner {
  display: grid;
  gap: 2.5rem;
}

.contact__eyebrow {
  color: var(--navy-400);
}

.contact__title {
  margin-top: 0.6rem;
  font-family: var(--font-display);
  font-size: var(--step-h2);
  font-weight: 500;
  letter-spacing: -0.015em;
}

.contact__lead {
  margin-top: 0.75rem;
  max-width: 42ch;
  color: #b7cbe0;
}

.offices {
  display: grid;
  gap: 0.65rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--navy-600);
}

.offices div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: var(--step-caption);
}

.offices dt {
  color: var(--navy-400);
}

.offices dd {
  margin: 0;
}

.card {
  background: var(--paper);
  color: var(--ink);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.field--wide,
.error,
.submit {
  grid-column: 1 / -1;
}

label {
  font-size: var(--step-eyebrow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

input,
select,
textarea {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0.65rem 0.75rem;
  background: var(--paper-sunk);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  font-size: var(--step-caption);
  transition: border-color var(--dur-fast) var(--ease-out);
}

textarea {
  resize: vertical;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--navy-600);
}

.error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius);
  background: var(--danger-tint);
  color: var(--danger);
  font-size: var(--step-caption);
}

.submit {
  padding: 0.85rem;
  border-radius: var(--radius);
  background: var(--navy-800);
  color: #fff;
  font-weight: 500;
  transition: background var(--dur-fast) var(--ease-out);
}

.submit:hover:not(:disabled) {
  background: var(--navy-900);
}

.submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.receipt {
  display: grid;
  gap: 0.5rem;
  padding-block: 1rem;
  scroll-margin-block: 5rem;
}

.receipt:focus {
  outline: none;
}

.receipt__badge {
  justify-self: start;
  font-size: var(--step-eyebrow);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--success);
  background: var(--wer-tint);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

.receipt__reference {
  font-size: var(--step-h2);
  font-weight: 500;
}

.receipt__copy {
  color: var(--ink-muted);
  font-size: var(--step-caption);
}

.ghost {
  justify-self: start;
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius);
  font-size: var(--step-caption);
}

@media (min-width: 30rem) {
  .form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .contact__inner {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 4rem;
    align-items: start;
  }

  .card {
    padding: 2rem;
  }
}
</style>
