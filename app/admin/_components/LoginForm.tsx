import Link from "next/link";
import { motion } from "framer-motion";
import type { LoginFormState } from "../_lib/useLoginForm";

export default function LoginForm({ form }: { form: LoginFormState }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    info,
    isLoggingIn,
    isSendingReset,
    resetCooldown,
    handleLogin,
    handlePasswordReset,
  } = form;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#353941] p-6 relative">
      <Link
        href="/"
        className="absolute top-8 left-6 text-[#a0a0a0] hover:text-[#cda1b1] text-xs font-bold tracking-widest uppercase"
      >
        ← Zurück zur Webseite
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="font-(family-name:--font-great-vibes) text-5xl text-[#cda1b1] mb-2">
            MainBar
          </h1>
          <h2 className="text-[#a0a0a0] uppercase tracking-widest text-xs font-bold">
            Admin Portal
          </h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="admin-email" className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2 block">
              E-Mail
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-200 py-2.5 focus:outline-none focus:border-[#cda1b1]"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2 block">
              Passwort
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-2.5 focus:outline-none focus:border-[#cda1b1]"
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs text-center" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-4 rounded-full font-semibold uppercase tracking-widest text-xs"
          >
            {isLoggingIn ? "Wird geladen..." : "Einloggen"}
          </button>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isSendingReset || resetCooldown > 0}
            className="w-full text-center text-xs text-[#a0a0a0] hover:text-[#cda1b1] underline underline-offset-4 disabled:opacity-60 disabled:no-underline"
          >
            {isSendingReset
              ? "Wird gesendet..."
              : resetCooldown > 0
                ? `Erneut senden in ${resetCooldown} s`
                : "Passwort vergessen?"}
          </button>
          {info && (
            <p className="text-green-700 text-xs text-center" role="status">{info}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
