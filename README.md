<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<a href="https://github.com/isenstec-max/ClassQuiz2/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/mawoka-myblock/ClassQuiz2?style=for-the-badge"></a>
<a href="https://github.com/isenstec-max/ClassQuiz2/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/mawoka-myblock/ClassQuiz2?color=green&style=for-the-badge"></a>
<a href="https://github.com/isenstec-max/ClassQuiz2/network/members"><img alt="GitHub forks" src="https://img.shields.io/github/forks/mawoka-myblock/ClassQuiz2?style=for-the-badge"></a>
<a href="https://github.com/isenstec-max/ClassQuiz2/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"><img alt="GitHub issues" src="https://img.shields.io/github/issues/mawoka-myblock/ClassQuiz2?style=for-the-badge"></a>
<a href="https://github.com/isenstec-max/ClassQuiz2/blob/master/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/mawoka-myblock/ClassQuiz2?style=for-the-badge"></a>
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/mawoka-myblock/ClassQuiz2?style=for-the-badge">
[![DeepSource](https://deepsource.io/gh/mawoka-myblock/ClassQuiz2.svg/?label=active+issues&show_trend=true&token=5-2Na9HN-2CXcGkHjah_Rk09&style=for-the-badge)](https://deepsource.io/gh/mawoka-myblock/ClassQuiz2/)
<img alt="Snky badge" src="https://img.shields.io/badge/Snyk-Check-success?style=for-the-badge">
[![codecov](https://codecov.io/gh/mawoka-myblock/ClassQuiz2/branch/master/graph/badge.svg?token=7CHK2A0AMO)](https://codecov.io/gh/mawoka-myblock/ClassQuiz2)

<div align='center'>
    <h2 align='center'>ClassQuiz2</h2>
    <img src='https://raw.githubusercontent.com/isenstec-max/ClassQuiz2/refs/heads/master/IMG_20260930_200017.jpg' alt='ClassQuiz2 Logo' height='100px' width='100px'>
    <p align='center'>
        The open-source quiz-platform!
        <br/>
        <a href='https://ClassQuiz2.de/'><strong>Visit the website »</strong></a>
        <br />
        <br />
        <a href='https://ClassQuiz2.de/docs'>Docs</a>
        ·
        <a href='https://ClassQuiz2.de/account/register'>Register</a>
        ·
        <a href='https://ClassQuiz2.de/docs/self-host'>Self-Hosting</a>
        ·
        <a href='https://matrix.to/#/#ClassQuiz2:matrix.org'>Matrix Space</a>
    </p>
</div>


## About ClassQuiz2

ClassQuiz2 is a quiz app to learn interactively for students,
but open-source which is very important if it is a product for educational
purposes.
You can create quizzes and play them remotely with other people.
It is mainly made for teachers who create a
quiz, so students can compete with their knowledge against each other.

## Try it

There is a hosted version at [ClassQuiz2.de](https://ClassQuiz2.de?utm_medium=Github&utm_source=Readme). The server is
located in Karlsruhe, Germany and hosted by [netcup](https://mawoka.eu/redir?token=2), so expect some latency depending
on your location.

## Help/Community

Join our [Matrix Space](https://matrix.to/#/#ClassQuiz2:matrix.org) using [element](https://app.element.io)!

## Donating

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K3CK3ES)

<a href="https://liberapay.com/Mawoka/donate"><img src="https://img.shields.io/liberapay/goal/Mawoka.svg?logo=liberapay"></a>

## Self-Host

Please see https://ClassQuiz2.de/docs/self-host

## Development

See https://ClassQuiz2.de/docs/develop

## Translation

ClassQuiz2 uses [hosted Weblate](https://hosted.weblate.org/engage/ClassQuiz2/)


<a href="https://hosted.weblate.org/engage/ClassQuiz2/">
<img src="https://hosted.weblate.org/widgets/ClassQuiz2/-/frontend/multi-auto.svg" alt="Übersetzungsstatus" />
</a>

## Docs

The docs are online at https://ClassQuiz2.de/docs

### Things to know about the structure

Since this repo is a monorepo, the frontend is located in
the [`frontend/`](https://github.com/isenstec-max/ClassQuiz2/tree/master/frontend)-directory.
The backend-project (Pipfile) is in the root, but all the code is located in
the [`ClassQuiz2/`](https://github.com/isenstec-max/ClassQuiz2/tree/master/frontend)-folder.

#### Tech-Stack

##### Backend

The backend is made with [FastAPI](https://fastapi.tiangolo.com/) (web-framework)
, [ormar](https://github.com/collerek/ormar/) (ORM)
, [python-socketio](https://python-socketio.readthedocs.io/en/latest/) (realtime-communication between server and
client)

##### Frontend

I create other modern Frontend like Kahoot!
<img src="https://raw.githubusercontent.com/isenstec-max/ClassQuiz2/1be59ae8e5da447d08934bf0fd469c8f7fd548be/Screenshot_2026-09-30-19-28-34-199_com.android.chrome.jpg" />

The frontend is made with [SvelteKit](https://kit.svelte.dev/) (web-framework)
and [TailwindCSS](https://tailwindcss.com/) (Css-Framework).

##### External Dependencies

Selfhostable:

- [Meilisearch](https://www.meilisearch.com/) (Search-Server)
- [Caddy](https://caddyserver.com/) (Reverse Proxy)
- [Postgres](https://www.postgresql.org/) (Database)
- [Redis](https://redis.io/) (Cache)

Closed-Source 3rd parties:

- [Mapbox](https://www.mapbox.com/) (maps)
- [hCaptcha](https://www.hcaptcha.com/) (captcha)

---

## License Note

This repository is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/);

please review the license to understand your rights and obligations.[^1]

[^1]: I added this note, since people are stealing my software and changing it without providing the source-code.
