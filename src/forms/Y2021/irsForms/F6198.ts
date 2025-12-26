import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import { ScheduleC as ScheduleCData } from 'ustaxes/core/data'

export default class F6198 extends F1040Attachment {
  tag: FormTag = 'f6198'
  sequenceIndex = 181

  scheduleCData: ScheduleCData

  constructor(f1040: F1040, scheduleCData: ScheduleCData) {
    super(f1040)
    this.scheduleCData = scheduleCData
  }

  isNeeded = (): boolean => {
      return false
  }

  fields = (): Field[] => {
      return []
  }
}
