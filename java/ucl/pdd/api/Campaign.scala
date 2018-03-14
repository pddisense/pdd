/*
 * Private Data Donor is a platform to collect search logs via crowd-sourcing.
 * Copyright (C) 2017-2018 Vincent Primault <v.primault@ucl.ac.uk>
 *
 * Private Data Donor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Private Data Donor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Private Data Donor.  If not, see <http://www.gnu.org/licenses/>.
 */

package ucl.pdd.api

import com.github.nscala_time.time.Imports._
import org.joda.time.Instant

/**
 * A campaign corresponds to a vocabulary tracked during a given period of time.
 *
 * @param name             Campaign name, unique among all campaigns.
 * @param createTime       Time at which the campaign was created.
 * @param displayName      Human-readable name of this campaign.
 * @param email            E-mail addresses associated with this campaign. They are not publicly
 *                         displayed to the users but receive notifications sent by the system.
 * @param vocabulary       Last version of the vocabulary tracked by this campaign. We do not keep
 *                         a history of the vocabularies here, this is implicitly tracked by the
 *                         various aggregations created as part of this campaign.
 * @param startTime        Time at which this campaign starts.
 * @param endTime          Time at which this campaign completes. After this time, no new
 *                         aggregations will be generated for this campaign, but currently active
 *                         aggregations will remain active for at most `delay` + `graceDelay`. It
 *                         can be left empty for an open-ended campaign.
 * @param collectRaw       Whether the raw counts are collected.
 * @param collectEncrypted Whether the encrypted counts are collected.
 * @param delay            Delay after which the aggregation is made available.
 * @param graceDelay       Additional delay during which the sketches are still accepted, thus
 *                         allowing the aggregation to be refined. This delay starts after the
 *                         initial `delay` is expired.
 * @param groupSize        Expected group size. It is a hint for the group forming strategy as what the
 *                         size of a group should be. In practice, it is an upper bound.
 * @param samplingRate     A sampling rate to apply when creating aggregations. It means that only
 *                         a subset of clients will be considered and integrated into groups.
 */
case class Campaign(
  name: String,
  createTime: Instant,
  displayName: Option[String],
  email: Seq[String],
  vocabulary: Vocabulary,
  startTime: Option[Instant],
  endTime: Option[Instant],
  collectRaw: Boolean,
  collectEncrypted: Boolean,
  delay: Int,
  graceDelay: Int,
  groupSize: Int,
  samplingRate: Option[Double]) {

  def withoutVocabulary: Campaign = copy(vocabulary = Vocabulary())

  def isStarted: Boolean = startTime.exists(_ < Instant.now)

  def isCompleted: Boolean = endTime.exists(_ < Instant.now)

  def isActive: Boolean = isStarted && !isCompleted
}
