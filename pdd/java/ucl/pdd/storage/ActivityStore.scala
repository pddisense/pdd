/*
 * Copyright 2017-2018 UCL / Vincent Primault <v.primault@ucl.ac.uk>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package ucl.pdd.storage

import com.twitter.util.Future
import org.joda.time.Instant
import ucl.pdd.api.Activity

trait ActivityStore {
  /**
   * Persist a new activity.
   *
   * @param activity Activity to save.
   */
  def create(activity: Activity): Future[Unit]

  def list(query: ActivityStore.Query = ActivityStore.Query()): Future[Seq[Activity]]

  def delete(query: ActivityStore.Query): Future[Int]
}


object ActivityStore {

  case class Query(
    startTime: Option[Instant] = None,
    endTime: Option[Instant] = None,
    clientName: Option[String] = None,
    countryCode: Option[String] = None)

}
