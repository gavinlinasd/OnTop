class ChangeColumnSubjectToString < ActiveRecord::Migration
  def up
    change_column :tickets, :subject, :string
  end

  def down
    change_column :tickets, :subject, :text
  end
end
