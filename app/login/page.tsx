import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div
            className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: "#7a5d3a" }}
          >
            Welcome
          </div>
          <h1
            className="font-serif italic"
            style={{ fontSize: 52, fontWeight: 500, lineHeight: 1, color: "#2c1d0f" }}
          >
            Lectio<span style={{ color: "#a87132" }}>.</span>
          </h1>
          <p className="mt-4 text-base" style={{ color: "#5a4023" }}>
            A quiet record of chapters read.
          </p>
        </div>

        <div
          className="p-8"
          style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
        >
          <LoginForm />
        </div>

        <div
          className="mt-8 text-center font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "#a89070" }}
        >
          ✦ &nbsp; 1189 chapters &nbsp;·&nbsp; 66 books &nbsp; ✦
        </div>
      </div>
    </div>
  );
}
