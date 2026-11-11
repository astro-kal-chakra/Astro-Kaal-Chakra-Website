"use client";

import { useSyncExternalStore } from "react";

/**
 * Academy state on this device (demo, until backend enrolment): { enrolled: { [course]: info },
 * subs: { [course]: { plan, orderId, amount, booked } }, done: { [lessonId]: true }, notes: { [lessonId]: text } }.
 * Persists and syncs across tabs. Reads as null until hydrated, so pages never flash the wrong step.
 */
const KEY = "academy_v1";
const EVENT = "academy:change";
const EMPTY = { enrolled: {}, subs: {}, done: {}, notes: {} };
let cache = null;

const read = () => {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    cache = EMPTY;
  }
  return cache;
};

const update = (fn) => {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (cb) => {
  const onStorage = (e) => e.key === KEY && ((cache = null), cb());
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
};

export const useAcademy = () => useSyncExternalStore(subscribe, read, () => null);

export const academy = {
  enroll: (course, info) => update((s) => ({ ...s, enrolled: { ...s.enrolled, [course]: { ...info, at: Date.now() } } })),
  activate: (course, sub) => update((s) => ({ ...s, subs: { ...s.subs, [course]: { ...sub, booked: [], at: Date.now() } } })),
  bookSession: (course, slot) => update((s) => ({ ...s, subs: { ...s.subs, [course]: { ...s.subs[course], booked: [...s.subs[course].booked, slot] } } })),
  toggleDone: (lessonId) => update((s) => ({ ...s, done: { ...s.done, [lessonId]: !s.done[lessonId] } })),
  markDone: (lessonId) => update((s) => (s.done[lessonId] ? s : { ...s, done: { ...s.done, [lessonId]: true } })),
  saveNote: (lessonId, text) => update((s) => ({ ...s, notes: { ...s.notes, [lessonId]: text } })),
};
