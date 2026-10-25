import assert from 'node:assert/strict';
import test from 'node:test';
import { readNamedCookie } from './cookieStorage.ts';

test('cookie reader keeps values that contain equals signs', () => {
  const header = 'other=1; salkal_user_prefs=abc%3Ddef; trailing=no';
  assert.equal(readNamedCookie(header, 'salkal_user_prefs'), 'abc=def');
});

test('cookie reader ignores a name that is only a prefix', () => {
  const header = 'salkal_user_prefs_extra=secret; theme=dark';
  assert.equal(readNamedCookie(header, 'salkal_user_prefs'), null);
});

test('cookie reader returns the raw value when percent-decoding fails', () => {
  assert.equal(readNamedCookie('salkal_user_prefs=%E0%A4%A', 'salkal_user_prefs'), '%E0%A4%A');
});
