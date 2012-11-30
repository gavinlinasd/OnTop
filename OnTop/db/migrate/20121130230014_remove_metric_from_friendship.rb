class RemoveMetricFromFriendship < ActiveRecord::Migration
  def up
    remove_column :friendships, :metric
  end

  def down
    add_column :friendships, :metric, :decimal
  end
end
