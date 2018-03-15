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

package ucl.pdd.storage.memory

import java.util.concurrent.ConcurrentHashMap

import com.twitter.util.Future
import ucl.pdd.api.{Client, instantOrdering}
import ucl.pdd.storage.{ClientQuery, ClientStore}

import scala.collection.JavaConverters._

private[memory] final class MemoryClientStore extends ClientStore {
  private[this] val index = new ConcurrentHashMap[String, Client]().asScala

  override def create(client: Client): Future[Boolean] = {
    Future.value(index.putIfAbsent(client.name, client).isEmpty)
  }

  override def replace(client: Client): Future[Boolean] = {
    Future.value(index.replace(client.name, client).isDefined)
  }

  override def list(query: ClientQuery): Future[Seq[Client]] = {
    Future.value(index.values.filter(query.matches).toSeq.sortBy(_.createTime).reverse)
  }

  override def get(name: String): Future[Option[Client]] = Future.value(index.get(name))
}