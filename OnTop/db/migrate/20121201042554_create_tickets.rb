class CreateTickets < ActiveRecord::Migration
  def change
    create_table :tickets do |t|
      t.string :name
      t.string :email
      t.text :subject
      t.text :body

      t.timestamps
    end
  end
end
