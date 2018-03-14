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
import ucl.pdd.api.Sketch
import ucl.pdd.storage.{SketchQuery, SketchStore}

import scala.collection.JavaConverters._

private[memory] final class MemorySketchStore extends SketchStore {
  private[this] val index = new ConcurrentHashMap[String, Sketch]().asScala

  override def create(sketch: Sketch): Future[Boolean] = {
    Future.value(index.putIfAbsent(sketch.name, sketch).isEmpty)
  }

  override def replace(sketch: Sketch): Future[Boolean] = {
    Future.value(index.replace(sketch.name, sketch).isDefined)
  }

  override def delete(name: String): Future[Boolean] = {
    Future.value(index.remove(name).isDefined)
  }

  override def list(query: SketchQuery = SketchQuery()): Future[Seq[Sketch]] = {
    Future.value(index.values.filter(query.matches).toSeq)
  }
}
