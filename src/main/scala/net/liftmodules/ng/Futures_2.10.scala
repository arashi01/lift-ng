package net.liftmodules.ng

import net.liftweb.json._
import scala.concurrent.{ExecutionContext, Future}
import net.liftweb.actor.LAFuture
import net.liftweb.common.{Empty, Failure, Full, Box}
import net.liftweb.util.StringHelpers._

object AngularExecutionContext {
  implicit var ec:ExecutionContext = ExecutionContext.global
  def apply(ec:ExecutionContext) {
    this.ec = ec
  }
}

trait ScalaFutureSerializer {
  def scalaFutureSerializer(formats:Formats)(implicit ctx:ExecutionContext):PartialFunction[Any, JValue] = {
    case future:Future[_] => LAFutureSerializer.laFuture2JValue(formats, FutureConversions.FutureToLAFuture(future))
  }
}

object FutureConversions {
  implicit def FutureToLAFuture[T](f:Future[T])(implicit ctx:ExecutionContext):LAFuture[Box[T]] = f.la

  implicit class ConvertToLA[T](f: Future[T])(implicit ctx:ExecutionContext) {
    lazy val la:LAFuture[Box[T]] = {
      val laf = new LAFuture[Box[T]]()
      f.foreach(t => laf.satisfy(Full(t)))
      f.onFailure({ case t:Throwable => laf.satisfy(Failure(
        encJs(t.getMessage).drop(1).dropRight(1), // Encode into valid JS, but strip the quotes it adds
        Full(t), Empty
      )) })
      laf
    }
  }
}
