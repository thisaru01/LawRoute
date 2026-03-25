export default function Hero() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold text-slate-700">
            Legal help, made simple
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Connect with lawyers, manage cases, and get answers faster.
          </h1>
          <p className="text-pretty text-base leading-7 text-slate-700">
            LawRoute helps citizens find the right legal support and helps
            lawyers manage consultations and case documents in one place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Request a consultation
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Browse articles
            </a>
          </div>

          <dl className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-medium text-slate-600">
                Verified profiles
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                Lawyers
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-medium text-slate-600">Structured</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                Cases
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-medium text-slate-600">Secure</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                Documents
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Quick start
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Choose what you want to do first:
              </p>
            </div>

            <div className="grid gap-3">
              <a
                href="#"
                className="group rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-900">
                  I’m a citizen
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Request legal guidance and track your consultation.
                </p>
              </a>
              <a
                href="#"
                className="group rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  I’m a lawyer
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Manage your profile, consultations, and case documents.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Find the right fit
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Search by expertise and connect with professionals that match your
            needs.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Keep everything organized
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Cases, meetings, and documents stay together in a single workflow.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Learn as you go
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Read practical articles and stay informed before your next step.
          </p>
        </div>
      </section>
    </div>
  );
}
