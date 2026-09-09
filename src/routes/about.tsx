import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, GraduationCap, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/logo.png";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EDUCATOR } from "@/lib/profile-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `${EDUCATOR.name} — ECD educator & tutor` },
      {
        name: "description",
        content:
          "Itumeleng Kgaswane: 5+ years in early childhood development and Foundation Phase teaching in Kwa-Thema — lesson planning, reading and literacy, tutoring and children's books.",
      },
      { property: "og:title", content: `${EDUCATOR.name} — ECD educator & tutor` },
      {
        property: "og:description",
        content:
          "Early childhood development, reading and literacy, personalised timetables, tutoring and Christian children's books.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 sm:py-14">
          <img src={logo} alt="" width={96} height={96} className="size-20 sm:size-24" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-clay">{EDUCATOR.title}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {EDUCATOR.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{EDUCATOR.intro}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {EDUCATOR.location}
              </span>
              <a className="flex items-center gap-1.5 hover:text-primary" href={`mailto:${EDUCATOR.email}`}>
                <Mail className="size-4" /> {EDUCATOR.email}
              </a>
              <a
                className="flex items-center gap-1.5 hover:text-primary"
                href={`tel:${EDUCATOR.phone.replace(/\s/g, "")}`}
              >
                <Phone className="size-4" /> {EDUCATOR.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-3">
          {EDUCATOR.stats.map((stat) => (
            <Card key={stat.label} className="bg-secondary">
              <CardContent className="py-5 text-center">
                <p className="font-display text-2xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">About</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{EDUCATOR.about}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">What Itumeleng offers</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EDUCATOR.offers.map((offer) => (
              <Card key={offer.title}>
                <CardHeader>
                  <CardTitle className="font-display text-base">{offer.title}</CardTitle>
                  <CardDescription>{offer.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Skills</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {EDUCATOR.skillGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="secondary" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Experience</h2>
          <div className="mt-4 space-y-4 border-l-2 border-border pl-5">
            {EDUCATOR.experience.map((job) => (
              <div key={job.role + job.org} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 size-3 rounded-full bg-clay" />
                <p className="font-display text-base font-semibold">{job.role}</p>
                <p className="text-sm text-primary">{job.org}</p>
                <p className="text-xs text-muted-foreground">{job.period}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{job.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <GraduationCap className="size-5 text-primary" /> Qualifications & certificates
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EDUCATOR.credentials.map((credential) => (
              <Card key={credential.title}>
                <CardContent className="py-4">
                  <p className="flex items-start gap-2 text-sm font-medium">
                    <Award className="mt-0.5 size-4 shrink-0 text-clay" />
                    {credential.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{credential.org}</p>
                  <p className="text-xs text-muted-foreground">{credential.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Additional training: </span>
            {EDUCATOR.additionalTraining}
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <HeartHandshake className="size-5 text-primary" /> Community involvement
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {EDUCATOR.community.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="font-display text-base">{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="font-display text-base">Why this app exists</CardTitle>
              <CardDescription>
                Teaching young children well takes time that admin keeps stealing. These tools use AI for the
                writing and structuring, so the educator's time goes back to the children — with the educator
                always making the final call.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/">Open the dashboard</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/responsible-ai">Responsible AI</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
