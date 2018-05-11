/*
 * PDD is a platform for privacy-preserving Web searches collection.
 * Copyright (C) 2016-2018 Vincent Primault <v.primault@ucl.ac.uk>
 *
 * PDD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PDD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PDD.  If not, see <http://www.gnu.org/licenses/>.
 */

package ucl.pdd.service

import com.twitter.util.{Await, Future}
import org.joda.time.{DateTime, DateTimeZone}
import org.scalatest.BeforeAndAfterEach
import ucl.pdd.api.{Campaign, Sketch, Vocabulary, VocabularyQuery}
import ucl.pdd.storage.memory.MemoryStorage
import ucl.pdd.storage.{AggregationStore, Storage}
import ucl.testing.UnitSpec

/**
 * Unit tests for [[AggregateSketchesJob]].
 */
class AggregateSketchesJobSpec extends UnitSpec with BeforeAndAfterEach {
  behavior of "AggregateSketchesJob"

  private[this] var job: AggregateSketchesJob = _
  private[this] var storage: Storage = _
  private[this] val timezone = DateTimeZone.forID("Europe/London")
  private[this] val now = DateTime.now(timezone)

  override def beforeEach(): Unit = {
    storage = new MemoryStorage
    Await.ready(storage.startUp())
    val startTime = now.minusDays(2).withTimeAtStartOfDay().toInstant
    val campaign1 = Campaign(
      name = "campaign1",
      createTime = now.toInstant,
      displayName = "a campaign",
      email = None,
      notes = None,
      vocabulary = Vocabulary(Seq(VocabularyQuery(exact = Some("foo")))),
      startTime = Some(startTime),
      endTime = None,
      collectRaw = true,
      collectEncrypted = true,
      delay = 0,
      graceDelay = 0,
      groupSize = 3,
      samplingRate = None)
    val campaign2 = campaign1.copy(name = "campaign2")
    Await.ready(Future.join(storage.campaigns.create(campaign1), storage.campaigns.create(campaign2)))

    job = new AggregateSketchesJob(storage, timezone, testingMode = false)
    super.beforeEach()
  }

  override def afterEach(): Unit = {
    Await.ready(storage.shutDown())
    storage = null
    job = null
    super.afterEach()
  }

  it should "aggregate sketches for several campaigns" in {
    val sketches = Seq(
      Sketch(
        name = "sketch1",
        campaignName = "campaign1",
        clientName = "client1",
        day = 0,
        group = 0,
        submitted = true,
        rawValues = Some(Seq(1, 0, 2)),
        encryptedValues = Some(Seq("-1", "0", "1")),
        publicKey = "pubkey1"),
      Sketch(
        name = "sketch2",
        campaignName = "campaign1",
        clientName = "client2",
        day = 0,
        submitted = true,
        rawValues = Some(Seq(0, 0, 1)),
        encryptedValues = Some(Seq("1", "1", "-2")),
        group = 0,
        publicKey = "pubkey2"),
      Sketch(
        name = "sketch3",
        campaignName = "campaign1",
        clientName = "client3",
        day = 0,
        group = 0,
        submitted = true,
        rawValues = Some(Seq(0, 1, 2)),
        encryptedValues = Some(Seq("2", "0", "6")),
        publicKey = "pubkey3"),
      Sketch(
        name = "sketch4",
        campaignName = "campaign1",
        clientName = "client4",
        day = 0,
        submitted = true,
        group = 1,
        rawValues = Some(Seq(0, 1, 0)),
        encryptedValues = Some(Seq("2", "0", "-3")),
        publicKey = "pubkey4"),
      Sketch(
        name = "sketch5",
        campaignName = "campaign1",
        clientName = "client5",
        day = 0,
        group = 1,
        submitted = false,
        publicKey = "pubkey5"),

      Sketch(
        name = "sketch6",
        campaignName = "campaign1",
        clientName = "client1",
        day = 1,
        group = 0,
        submitted = false,
        publicKey = "pubkey1"),
      Sketch(
        name = "sketch7",
        campaignName = "campaign1",
        clientName = "client2",
        day = 1,
        group = 0,
        submitted = false,
        publicKey = "pubkey2"),

      Sketch(
        name = "sketch8",
        campaignName = "campaign2",
        clientName = "client2",
        day = 0,
        group = 0,
        rawValues = Some(Seq(0, 1, 2)),
        encryptedValues = Some(Seq("2", "0", "6")),
        submitted = true,
        publicKey = "pubkey2"),
      Sketch(
        name = "sketch9",
        campaignName = "campaign2",
        clientName = "client3",
        day = 0,
        group = 0,
        submitted = true,
        rawValues = Some(Seq(1, 1, 0)),
        encryptedValues = Some(Seq("-1", "2", "-4")),
        publicKey = "pubkey3"))
    Await.result(Future.collect(sketches.map(storage.sketches.create)))

    job.execute(now.toInstant)

    val agg1 = Await.result(storage.aggregations.list(AggregationStore.Query(campaignName = "campaign1")))
    agg1 should have size 1
    agg1.head.day shouldBe 0
    agg1.head.rawValues shouldBe Seq(1, 2, 5)
    agg1.head.decryptedValues shouldBe Seq(2, 1, 5)
    agg1.head.stats.activeCount shouldBe 5
    agg1.head.stats.submittedCount shouldBe 4
    agg1.head.stats.decryptedCount shouldBe 3

    val agg2 = Await.result(storage.aggregations.list(AggregationStore.Query(campaignName = "campaign2")))
    agg2 should have size 1
    agg2.head.day shouldBe 0
    agg2.head.rawValues shouldBe Seq(1, 2, 2)
    agg2.head.decryptedValues shouldBe Seq(1, 2, 2)
    agg2.head.stats.activeCount shouldBe 2
    agg2.head.stats.submittedCount shouldBe 2
    agg2.head.stats.decryptedCount shouldBe 2
  }
}
