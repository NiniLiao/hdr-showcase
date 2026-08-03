<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/api/client'
import { FILTERS } from '@/stores/services'
import type { ContactPayload, ContactReceipt, DisciplineId } from '@/types'

const form = reactive<ContactPayload>({
  name: '',
  email: '',
  organisation: '',
  discipline: 'general',
  message: '',
})

const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorMessage = ref('')
const receipt = ref<ContactReceipt | null>(null)

const disciplines = FILTERS.filter((filter) => filter.id !== 'all') as ReadonlyArray<{
  id: DisciplineId
  label: string
}>

async function send() {
  status.value = 'sending'
  errorMessage.value = ''

  try {
    receipt.value = await api.contact({ ...form })
    status.value = 'sent'
  } catch (cause) {
    errorMessage.value = cause instanceof Error ? cause.message : 'Something went wrong.'
    status.value = 'error'
  }
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
        <p class="eyebrow contact__eyebrow">Contact portal</p>
        <h2 class="contact__title">Start a project with us</h2>
        <p class="contact__lead">
          Tell us what you are trying to build. We route the enquiry to the office that has done it
          before and reply within two working days.
        </p>

        <dl class="offices">
          <div><dt>Americas</dt><dd class="mono">+1 402 399 1000</dd></div>
          <div><dt>Asia Pacific</dt><dd class="mono">+61 2 8081 4600</dd></div>
          <div><dt>Europe</dt><dd class="mono">+44 20 7451 3200</dd></div>
        </dl>
      </div>

      <div class="card">
        <div v-if="status === 'sent' && receipt" class="receipt">
          <p class="receipt__badge mono">Received</p>
          <p class="receipt__reference mono">{{ receipt.reference }}</p>
          <p class="receipt__copy">
            Routed to {{ receipt.office }}. Someone will reply by
            <span class="mono">{{ receipt.respondBy }}</span
            >.
          </p>
          <button class="ghost" type="button" @click="reset">Send another enquiry</button>
        </div>

        <form v-else class="form" novalidate @submit.prevent="send">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" v-model="form.name" type="text" autocomplete="name" required />
          </div>

          <div class="field">
            <label for="email">Email</label>
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
            <label for="organisation">Organisation</label>
            <input id="organisation" v-model="form.organisation" type="text" autocomplete="organization" />
          </div>

          <div class="field">
            <label for="discipline">Discipline</label>
            <select id="discipline" v-model="form.discipline">
              <option value="general">General enquiry</option>
              <option v-for="item in disciplines" :key="item.id" :value="item.id">
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="field field--wide">
            <label for="message">What are you building?</label>
            <textarea id="message" v-model="form.message" rows="4" required></textarea>
          </div>

          <p v-if="status === 'error'" class="error" role="alert">{{ errorMessage }}</p>

          <button class="submit" type="submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? 'Sending…' : 'Send enquiry' }}
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.field {
  display: grid;
  gap: 0.35rem;
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
