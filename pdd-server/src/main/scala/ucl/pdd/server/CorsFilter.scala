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
package ucl.pdd.server

import com.google.inject.Singleton
import com.twitter.finagle.http.filter.Cors
import com.twitter.finagle.http.{Request, Response}
import com.twitter.finagle.{Service, SimpleFilter}
import com.twitter.util.Future

@Singleton
private[server] final class CorsFilter extends SimpleFilter[Request, Response] {
  private[this] val cors = {
    val allowsOrigin = { origin: String => Some(origin) }
    val allowsMethods = { method: String => Some(Seq("GET", "POST", "PUT", "PATCH", "DELETE")) }
    val allowsHeaders = { headers: Seq[String] => Some(headers) }
    val policy = Cors.Policy(allowsOrigin, allowsMethods, allowsHeaders)
    new Cors.HttpFilter(policy)
  }

  override def apply(request: Request, service: Service[Request, Response]): Future[Response] = {
    cors.apply(request, service)
  }
}
