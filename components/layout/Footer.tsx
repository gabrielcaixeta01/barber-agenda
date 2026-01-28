export default function Footer() {
  return (
    <footer className="border-t border-black/10 py-6 text-center text-sm opacity-70">
      © {new Date().getFullYear()} Barbearia — Agendamento online
    </footer>
  );
}