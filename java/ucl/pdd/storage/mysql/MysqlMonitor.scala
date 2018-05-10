/*
 * Colossus is framework to build API servers, based on Finagle.
 * Copyright (C) 2016-2018 Vincent Primault <v.primault@ucl.ac.uk>
 *
 * Accio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Accio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Colossus.  If not, see <http://www.gnu.org/licenses/>.
 */

package ucl.pdd.storage.mysql

import com.twitter.finagle.mysql.ServerError
import com.twitter.inject.Logging
import com.twitter.util.{Local, Monitor}

object MysqlMonitor extends Monitor with Logging {
  private[this] val local = new Local[Set[Short]]

  @inline
  def ignoring[T](whitelistedErrors: Short*)(f: => T): T = {
    local() = whitelistedErrors.toSet
    try {
      f
    } finally {
      local.clear()
    }
  }

  override def handle(exc: Throwable): Boolean = {
    exc match {
      case s: ServerError => local().getOrElse(Set.empty).contains(s.code)
      case _ => false
    }
  }
}
