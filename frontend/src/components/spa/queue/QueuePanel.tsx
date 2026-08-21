"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import {
  formatDateLabel,
  isSlotPastForDate,
  TIME_SLOTS,
} from "@/lib/queue/types";
import type { CSSProperties } from "react";
import { useEffect } from "react";

const STEPS = [1, 2, 3, 4] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="queue-steps" aria-label="Booking steps">
      {STEPS.map((n) => (
        <span
          key={n}
          className={`queue-step${n === current ? " active" : ""}${n < current ? " done" : ""}`}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

function StepServices() {
  const {
    services,
    selectedServiceIds,
    toggleService,
    servicesLoading,
    servicesError,
    reloadServices,
  } = useQueue();
  const { t } = useLanguage();

  if (servicesLoading) {
    return (
      <div className="queue-step-body">
        <p className="queue-status">
          <I18n k="queue.loading" />
        </p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="queue-step-body">
        <p className="queue-status queue-status--error">{servicesError}</p>
        <button type="button" className="queue-btn queue-btn--ghost" onClick={() => void reloadServices()}>
          <I18n k="queue.retry" />
        </button>
      </div>
    );
  }

  return (
    <div className="queue-step-body">
      <h3 className="queue-step-title">
        <I18n k="queue.step1.title" />
      </h3>
      <p className="queue-step-sub">
        <I18n k="queue.step1.sub" />
      </p>
      <div className="queue-service-list">
        {services.map((service) => {
          const selected = selectedServiceIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              className={`queue-service-card${selected ? " selected" : ""}`}
              onClick={() => toggleService(service.id)}
              style={
                {
                  "--tint1": service.tint1,
                  "--tint2": service.tint2,
                } as CSSProperties
              }
            >
              <span className="queue-service-card__swatch" aria-hidden="true" />
              <span className="queue-service-card__body">
                <strong>{t(service.nameKey)}</strong>
                <span>
                  {service.durationMin} <I18n k="queue.min" /> · {service.priceLabel}
                </span>
              </span>
              <span className="queue-service-card__check" aria-hidden="true">
                {selected ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSchedule() {
  const {
    dateOptions,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    bookedSlots,
    availabilityLoading,
  } = useQueue();
  const { lang } = useLanguage();

  const unavailableSet = new Set(bookedSlots);

  return (
    <div className="queue-step-body">
      <h3 className="queue-step-title">
        <I18n k="queue.step2.title" />
      </h3>
      <p className="queue-step-sub">
        <I18n k="queue.step2.sub" />
      </p>

      <p className="queue-field-label">
        <I18n k="queue.date" />
      </p>
      <div className="queue-date-row">
        {dateOptions.map((date) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const isToday =
            date.toDateString() === new Date().toDateString();
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={`queue-date-pill${isSelected ? " selected" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {isToday ? (
                <span className="queue-date-pill__tag">
                  <I18n k="queue.today" />
                </span>
              ) : null}
              {formatDateLabel(date, lang)}
            </button>
          );
        })}
      </div>

      <p className="queue-field-label">
        <I18n k="queue.time" />
        {availabilityLoading ? (
          <span className="queue-inline-loading"> · <I18n k="queue.loading" /></span>
        ) : null}
      </p>
      <div className="queue-time-grid">
        {TIME_SLOTS.map((slot) => {
          const unavailable =
            unavailableSet.has(slot) ||
            isSlotPastForDate(slot, selectedDate);
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              type="button"
              className={`queue-time-slot${isSelected ? " selected" : ""}${unavailable ? " unavailable" : ""}`}
              disabled={unavailable}
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <div className="queue-wait-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
        <span>
          <I18n k="queue.waitHint" />
        </span>
      </div>
    </div>
  );
}

function StepGuest() {
  const { guest, setGuest } = useQueue();

  return (
    <div className="queue-step-body">
      <h3 className="queue-step-title">
        <I18n k="queue.step3.title" />
      </h3>
      <p className="queue-step-sub">
        <I18n k="queue.step3.sub" />
      </p>

      <label className="queue-field">
        <span>
          <I18n k="queue.name" />
        </span>
        <input
          type="text"
          value={guest.name}
          placeholder=""
          onChange={(e) => setGuest({ name: e.target.value })}
        />
      </label>

      <label className="queue-field">
        <span>
          <I18n k="queue.phone" />
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={guest.phone}
          placeholder="0812345678"
          onChange={(e) => setGuest({ phone: e.target.value.replace(/\D/g, "") })}
        />
      </label>

      <label className="queue-field">
        <span>
          <I18n k="queue.guests" />
        </span>
        <div className="queue-guest-stepper">
          <button
            type="button"
            aria-label="Decrease guests"
            disabled={guest.guests <= 1}
            onClick={() => setGuest({ guests: guest.guests - 1 })}
          >
            −
          </button>
          <span>{guest.guests}</span>
          <button
            type="button"
            aria-label="Increase guests"
            disabled={guest.guests >= 4}
            onClick={() => setGuest({ guests: guest.guests + 1 })}
          >
            +
          </button>
        </div>
      </label>

      <label className="queue-field">
        <span>
          <I18n k="queue.notes" /> <em>(<I18n k="queue.optional" />)</em>
        </span>
        <textarea
          rows={3}
          value={guest.notes}
          onChange={(e) => setGuest({ notes: e.target.value })}
        />
      </label>
    </div>
  );
}

function StepConfirm() {
  const {
    selectedDate,
    selectedTime,
    guest,
    selectedServiceIds,
    services,
    totalPrice,
    totalDuration,
  } = useQueue();
  const { t, lang } = useLanguage();

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id),
  );

  return (
    <div className="queue-step-body">
      <h3 className="queue-step-title">
        <I18n k="queue.step4.title" />
      </h3>
      <p className="queue-step-sub">
        <I18n k="queue.step4.sub" />
      </p>

      <div className="queue-summary">
        <div className="queue-summary__block">
          <h4>
            <I18n k="queue.summary.services" />
          </h4>
          <ul>
            {selectedServices.map((s) => (
              <li key={s.id}>
                <span>{t(s.nameKey)}</span>
                <span>{s.priceLabel}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="queue-summary__row">
          <span>
            <I18n k="queue.date" />
          </span>
          <strong>{formatDateLabel(selectedDate, lang)}</strong>
        </div>
        <div className="queue-summary__row">
          <span>
            <I18n k="queue.time" />
          </span>
          <strong>{selectedTime}</strong>
        </div>
        <div className="queue-summary__row">
          <span>
            <I18n k="queue.duration" />
          </span>
          <strong>
            {totalDuration} <I18n k="queue.min" />
          </strong>
        </div>
        <div className="queue-summary__row">
          <span>
            <I18n k="queue.name" />
          </span>
          <strong>{guest.name}</strong>
        </div>
        <div className="queue-summary__row">
          <span>
            <I18n k="queue.phone" />
          </span>
          <strong>{guest.phone}</strong>
        </div>
        <div className="queue-summary__row">
          <span>
            <I18n k="queue.guests" />
          </span>
          <strong>{guest.guests}</strong>
        </div>

        {guest.notes ? (
          <div className="queue-summary__notes">
            <span>
              <I18n k="queue.notes" />
            </span>
            <p>{guest.notes}</p>
          </div>
        ) : null}

        <div className="queue-summary__total">
          <span>
            <I18n k="queue.total" />
          </span>
          <strong>{totalPrice.toLocaleString()} ฿</strong>
        </div>
      </div>
    </div>
  );
}

function StepSuccess() {
  const {
    queueNumber,
    selectedDate,
    selectedTime,
    resetBooking,
    closeQueue,
    totalDuration,
  } = useQueue();
  const { lang } = useLanguage();

  return (
    <div className="queue-step-body queue-success">
      <div className="queue-success__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      </div>
      <h3>
        <I18n k="queue.success.title" />
      </h3>
      <p className="queue-success__sub">
        <I18n k="queue.success.sub" />
      </p>
      <div className="queue-ticket">
        <span>
          <I18n k="queue.success.number" />
        </span>
        <strong>#{queueNumber}</strong>
      </div>
      <div className="queue-success__meta">
        <span>{formatDateLabel(selectedDate, lang)}</span>
        <span>{selectedTime}</span>
        <span>
          {totalDuration} <I18n k="queue.min" />
        </span>
      </div>
      <p className="queue-success__hint">
        <I18n k="queue.success.hint" />
      </p>
      <div className="queue-success__actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            resetBooking();
            closeQueue();
          }}
        >
          <I18n k="queue.success.done" />
        </button>
        <button
          type="button"
          className="btn-link"
          onClick={() => resetBooking()}
        >
          <I18n k="queue.success.another" />
        </button>
      </div>
    </div>
  );
}

export function QueuePanel() {
  const {
    isOpen,
    step,
    closeQueue,
    nextStep,
    prevStep,
    confirmBooking,
    selectedServiceIds,
    selectedTime,
    guest,
    cartCount,
    totalPrice,
    submitting,
    submitError,
  } = useQueue();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const canNext =
    step === 1
      ? selectedServiceIds.length > 0
      : step === 2
        ? selectedTime !== null
        : step === 3
          ? guest.name.trim().length > 0 && /^\d{10}$/.test(guest.phone.trim())
          : step === 4;

  if (!isOpen) return null;

  const stepNumber = step === "success" ? 4 : step;

  return (
    <div className="queue-overlay" role="presentation" onClick={closeQueue}>
      <aside
        className="queue-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="queue-panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="queue-panel__head">
          <div>
            <p className="queue-panel__eyebrow">
              <I18n k="queue.eyebrow" />
            </p>
            <h2 id="queue-panel-title">
              <I18n k="queue.title" />
            </h2>
          </div>
          <button
            type="button"
            className="queue-panel__close"
            aria-label="Close"
            onClick={closeQueue}
          >
            ×
          </button>
        </header>

        {step !== "success" ? (
          <>
            <StepIndicator current={stepNumber} />
            {cartCount > 0 && step === 1 ? (
              <div className="queue-cart-badge">
                {cartCount} <I18n k="queue.selected" /> ·{" "}
                {totalPrice.toLocaleString()} ฿
              </div>
            ) : null}
          </>
        ) : null}

        <div className="queue-panel__content">
          {step === 1 ? <StepServices /> : null}
          {step === 2 ? <StepSchedule /> : null}
          {step === 3 ? <StepGuest /> : null}
          {step === 4 ? <StepConfirm /> : null}
          {step === "success" ? <StepSuccess /> : null}
        </div>

        {step !== "success" ? (
          <footer className="queue-panel__foot">
            {submitError ? (
              <p className="queue-foot-error">{submitError}</p>
            ) : null}
            <div className="queue-panel__foot-actions">
            {step > 1 ? (
              <button type="button" className="queue-btn queue-btn--ghost" onClick={prevStep} disabled={submitting}>
                <I18n k="queue.back" />
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                type="button"
                className="queue-btn queue-btn--primary"
                disabled={!canNext}
                onClick={nextStep}
              >
                <I18n k="queue.next" />
              </button>
            ) : (
              <button
                type="button"
                className="queue-btn queue-btn--primary"
                disabled={submitting}
                onClick={() => void confirmBooking()}
              >
                {submitting ? <I18n k="queue.submitting" /> : <I18n k="queue.confirm" />}
              </button>
            )}
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
