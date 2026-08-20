"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createBooking,
  fetchAvailability,
  fetchServices,
} from "@/lib/api/queue";
import {
  getDateOptions,
  isSlotPastForDate,
  toDateString,
  type QueueService,
} from "@/lib/queue/types";

export type QueueStep = 1 | 2 | 3 | 4 | "success";

export type GuestInfo = {
  name: string;
  phone: string;
  guests: number;
  notes: string;
};

type QueueContextValue = {
  isOpen: boolean;
  step: QueueStep;
  services: QueueService[];
  servicesLoading: boolean;
  servicesError: string | null;
  bookedSlots: string[];
  availabilityLoading: boolean;
  selectedServiceIds: string[];
  selectedDate: Date;
  selectedTime: string | null;
  guest: GuestInfo;
  queueNumber: string | null;
  cartCount: number;
  totalPrice: number;
  totalDuration: number;
  dateOptions: Date[];
  submitting: boolean;
  submitError: string | null;
  openQueue: () => void;
  openQueueWithService: (serviceId: string) => void;
  closeQueue: () => void;
  setStep: (step: QueueStep) => void;
  toggleService: (serviceId: string) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  setGuest: (patch: Partial<GuestInfo>) => void;
  nextStep: () => void;
  prevStep: () => void;
  confirmBooking: () => Promise<void>;
  resetBooking: () => void;
  reloadServices: () => Promise<void>;
};

const defaultGuest: GuestInfo = {
  name: "",
  phone: "",
  guests: 1,
  notes: "",
};

const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<QueueStep>(1);
  const [services, setServices] = useState<QueueService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDateState] = useState(() =>
    getDateOptions(1)[0],
  );
  const [selectedTime, setSelectedTimeState] = useState<string | null>(null);
  const [guest, setGuestState] = useState<GuestInfo>(defaultGuest);
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dateOptions = useMemo(() => getDateOptions(7), []);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds],
  );

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices],
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.durationMin, 0),
    [selectedServices],
  );

  const reloadServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      setServicesError(
        error instanceof Error ? error.message : "Failed to load services",
      );
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadServices();
  }, [reloadServices]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      try {
        const data = await fetchAvailability(toDateString(selectedDate));
        if (!cancelled) {
          setBookedSlots(data.bookedSlots);
        }
      } catch {
        if (!cancelled) {
          setBookedSlots([]);
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (
      selectedTime &&
      isSlotPastForDate(selectedTime, selectedDate)
    ) {
      setSelectedTimeState(null);
    }
  }, [selectedDate, selectedTime]);

  const openQueue = useCallback(() => {
    setIsOpen(true);
    setStep(1);
    setSubmitError(null);
  }, []);

  const openQueueWithService = useCallback((serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev : [...prev, serviceId],
    );
    setIsOpen(true);
    setStep(1);
    setSubmitError(null);
  }, []);

  const closeQueue = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  }, []);

  const setSelectedDate = useCallback((date: Date) => {
    setSelectedDateState(date);
    setSelectedTimeState(null);
  }, []);

  const setSelectedTime = useCallback((time: string) => {
    setSelectedTimeState(time);
  }, []);

  const setGuest = useCallback((patch: Partial<GuestInfo>) => {
    setGuestState((prev) => ({ ...prev, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => {
      if (prev === 4) return prev;
      if (prev === "success") return prev;
      return (prev + 1) as QueueStep;
    });
    setSubmitError(null);
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => {
      if (prev === 1 || prev === "success") return prev;
      return (prev - 1) as QueueStep;
    });
    setSubmitError(null);
  }, []);

  const confirmBooking = useCallback(async () => {
    if (!selectedTime) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const booking = await createBooking({
        serviceSlugs: selectedServiceIds,
        bookingDate: toDateString(selectedDate),
        timeSlot: selectedTime,
        guestName: guest.name.trim(),
        guestPhone: guest.phone.trim(),
        guestCount: guest.guests,
        notes: guest.notes.trim() || undefined,
      });

      setQueueNumber(booking.queueNumber);
      setStep("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Booking failed",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedTime,
    selectedServiceIds,
    selectedDate,
    guest.name,
    guest.phone,
    guest.guests,
    guest.notes,
  ]);

  const resetBooking = useCallback(() => {
    setStep(1);
    setSelectedServiceIds([]);
    setSelectedDateState(getDateOptions(1)[0]);
    setSelectedTimeState(null);
    setGuestState(defaultGuest);
    setQueueNumber(null);
    setSubmitError(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      step,
      services,
      servicesLoading,
      servicesError,
      bookedSlots,
      availabilityLoading,
      selectedServiceIds,
      selectedDate,
      selectedTime,
      guest,
      queueNumber,
      cartCount: selectedServiceIds.length,
      totalPrice,
      totalDuration,
      dateOptions,
      submitting,
      submitError,
      openQueue,
      openQueueWithService,
      closeQueue,
      setStep,
      toggleService,
      setSelectedDate,
      setSelectedTime,
      setGuest,
      nextStep,
      prevStep,
      confirmBooking,
      resetBooking,
      reloadServices,
    }),
    [
      isOpen,
      step,
      services,
      servicesLoading,
      servicesError,
      bookedSlots,
      availabilityLoading,
      selectedServiceIds,
      selectedDate,
      selectedTime,
      guest,
      queueNumber,
      totalPrice,
      totalDuration,
      dateOptions,
      submitting,
      submitError,
      openQueue,
      openQueueWithService,
      closeQueue,
      toggleService,
      setSelectedDate,
      setSelectedTime,
      setGuest,
      nextStep,
      prevStep,
      confirmBooking,
      resetBooking,
      reloadServices,
    ],
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within QueueProvider");
  }
  return context;
}
