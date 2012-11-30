class AddDisplayNameToKeyword < ActiveRecord::Migration
  def change
    add_column :keywords, :display_name, :string
  end
end
