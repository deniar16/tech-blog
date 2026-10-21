---
slug: transaction-outbox-pattern
title: Transactional Outbox Pattern
date: Oct 20, 2026
published: 2026-10-20
minutes: 4 min
lede: What happens when you save your data and the event fails to send? Or when you send an event first and the save fails? Let's see how the Transactional Outbox Pattern handles these scenarios.
---

In a microservices architecture, a service sometimes stores data in a database and, after that save succeeds, notifies other services with an event.

Two failures can occur:

- The database commit succeeds, but sending the event fails. The database keeps the new row, but the other service receives no event.
- The event is sent, but the save fails and the transaction rolls back. The other service has the event, and the database has no saved row.

There is a common approach that we can use to solve these issues, which is the Transactional Outbox Pattern. This pattern is commonly used in microservices and event-based services that need consistency at the producer level.

Why is this pattern commonly used? Because the implementation is quite simple, let's look at these components.

<ol><li>The outbox table stores the event payload in the same transaction as the business data. After the transaction commits, a worker reads the data and sends it.</li><li>There are at least two workers to choose from.</li><li style="padding-left:3em" data-indent="1">The scheduler scans for new rows on a schedule and sends them to the target event.</li><li style="padding-left:6em" data-indent="2">pro: it is simpler.</li><li style="padding-left:6em" data-indent="2">cons: it can be a bottleneck if the request rate is high.</li><li style="padding-left:3em" data-indent="1">CDC (Change data capture) reads each new change and sends it.</li><li style="padding-left:6em" data-indent="2">pro: it is fast, and it does not need a scheduler.</li><li style="padding-left:6em" data-indent="2">cons: it needs to read the write-ahead log (WAL). The log name can differ by database. The reader can lag and needs monitoring, because it runs outside the application service.</li></ol>

Let's look at an order flow, when a user asks to mark an order as PAID.

:::diagram outbox
:::

**A gotcha:** because CDC, the scheduler, or Kafka can retry and produce more than one message, the consumer must recognize the repeated message, so a second delivery does not take the payment again.
