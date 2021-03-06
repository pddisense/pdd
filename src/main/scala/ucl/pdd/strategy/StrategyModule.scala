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

package ucl.pdd.strategy

import com.twitter.inject.TwitterModule

/**
 * Guice module configuring a group strategy.
 */
object StrategyModule extends TwitterModule {
  private val typeFlag = flag(
    "groups",
    "naive",
    "Which strategy to use to assign clients into groups. Valid values are: 'naive', 'frequency'.")

  override def configure(): Unit = {
    typeFlag() match {
      case "naive" => bind[GroupStrategy].toInstance(NaiveGroupStrategy)
      case "frequency" => bind[GroupStrategy].to[FrequencyGroupStrategy]
      case invalid => throw new IllegalArgumentException(s"Invalid groups type: $invalid")
    }
  }
}
