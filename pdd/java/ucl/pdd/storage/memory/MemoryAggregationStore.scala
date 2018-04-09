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
import ucl.pdd.api.Aggregation
import ucl.pdd.storage.AggregationStore

import scala.collection.JavaConverters._

private[memory] final class MemoryAggregationStore extends AggregationStore {
  private[this] val index = new ConcurrentHashMap[String, Aggregation]().asScala

  override def create(aggregation: Aggregation): Future[Boolean] = Future {
    index.putIfAbsent(aggregation.name, aggregation).isEmpty
  }

  override def replace(aggregation: Aggregation): Future[Boolean] = Future {
    index.replace(aggregation.name, aggregation).isDefined
  }

  override def list(query: AggregationStore.Query): Future[Seq[Aggregation]] = Future {
    index.values
      .filter(matches(query, _))
      .toSeq
      .sortWith { case (a, b) => a.day > b.day }
  }

  override def get(name: String): Future[Option[Aggregation]] = Future {
    index.get(name)
  }

  private def matches(query: AggregationStore.Query, aggregation: Aggregation): Boolean = {
    query.campaignName == aggregation.campaignName
  }
}
