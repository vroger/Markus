class PenaltyPeriodSubmissionRule < SubmissionRule

  def calculate_collection_time
    return assignment.due_date + hours_sum.hours
  end
  
  # When Students commit code after the collection time, MarkUs should warn
  # the Students with a message saying that the due date has passed, and the
  # work they're submitting will probably not be graded
  def commit_after_collection_message(grouping)
    I18n.t 'submission_rules.penalty_period_submission_rule.commit_after_collection_message'
  end
  
  def after_collection_message(grouping)
    I18n.t 'submission_rules.penalty_period_submission_rule.after_collection_message'
  end
  
  # This message will be dislayed to Students on viewing their file manager
  # after the due date has passed, but before the calculated collection date.
  def overtime_message(grouping)
    # How far are we into overtime?
    overtime_hours = calculate_overtime_hours_from(Time.now)  
    # Calculate the penalty that the grouping will suffer
    potential_penalty = calculate_penalty(overtime_hours)

    return I18n.t 'submission_rules.penalty_period_submission_rule.overtime_message', :potential_penalty => potential_penalty
  end
  
  
  # GracePeriodSubmissionRule works with all Assignments
  def assignment_valid?
    return !assignment.nil?
  end

  def apply_submission_rule(submission)
    # Calculate the appropriate penalty, and attach the ExtraMark to the
    # submission Result
    result = submission.result
    overtime_hours = calculate_overtime_hours_from(submission.revision_timestamp)
    penalty_amount = calculate_penalty(overtime_hours)
    if penalty_amount > 0
      penalty = ExtraMark.new
      penalty.result = result
      penalty.extra_mark = -penalty_amount
      penalty.unit = ExtraMark::UNITS[:percentage]

      penalty.description = I18n.t 'submission_rules.penalty_period_submission_rule.extramark_description', :overtime_hours => overtime_hours, :penalty_amount => penalty_amount
      penalty.save
    end

    return submission
  end

  def description_of_rule
    I18n.t 'submission_rules.penalty_period_submission_rule.description'
  end

  def grader_tab_partial
    return 'submission_rules/penalty_period/grader_tab'
  end

  private

  def hours_sum
    return periods.sum('hours')
  end

  def maximum_penalty
    return periods.sum('deduction')
  end

  # Given a number of overtime_hours, calculate the penalty percentage that
  # a student should get
  def calculate_penalty(overtime_hours)
    return 0 if overtime_hours <= 0
    total_penalty = 0
    periods.each do |period|
      deduction = period.deduction
      if deduction < 0
        deduction = -deduction
      end
      total_penalty = total_penalty + deduction
      overtime_hours = overtime_hours - period.hours
      break if overtime_hours <= 0
    end
    return total_penalty
  end

end


